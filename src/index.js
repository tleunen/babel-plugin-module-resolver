import path from 'path';
import resolve from 'resolve';
import glob from 'glob';
import findBabelConfig from 'find-babel-config';
import mapToRelative from './mapToRelative';
import { toLocalPath, toPosixPath } from './utils';

function replaceExt(p, ext) {
    const filename = path.basename(p, path.extname(p)) + ext;
    return path.join(path.dirname(p), filename);
}

const defaultBabelExtensions = ['.js', '.jsx', '.es', '.es6'];

export function mapModule(source, file, pluginOpts, cwd) {
    // Do not map source starting with a dot
    if (source[0] === '.') {
        return null;
    }

    // Search the file under the custom root directories
    const rootDirs = pluginOpts.root || [];
    const extensions = pluginOpts.extensions || defaultBabelExtensions;
    let resolvedSourceFile;
    rootDirs.some((dir) => {
        try {
            // check if the file exists (will throw if not)
            resolvedSourceFile = resolve.sync(`./${source}`, { basedir: path.resolve(cwd, dir), extensions });
            return true;
        } catch (e) {
            return false;
        }
    });

    if (resolvedSourceFile) {
        const realSourceFileExtension = path.extname(resolvedSourceFile);
        const sourceFileExtension = path.extname(source);
        // map the source and keep its extension if the import/require had one
        const ext = realSourceFileExtension === sourceFileExtension ? realSourceFileExtension : '';
        return toLocalPath(toPosixPath(replaceExt(mapToRelative(cwd, file, resolvedSourceFile), ext)));
    }

    // The source file wasn't found in any of the root directories. Lets try the alias
    const aliasMapping = pluginOpts.alias || {};
    const moduleSplit = source.split('/');

    let aliasPath;
    while (moduleSplit.length) {
        const m = moduleSplit.join('/');
        if ({}.hasOwnProperty.call(aliasMapping, m)) {
            aliasPath = aliasMapping[m];
            break;
        }
        moduleSplit.pop();
    }

    // no alias mapping found
    if (!aliasPath) {
        return null;
    }

    // remove legacy "npm:" prefix for npm packages
    aliasPath = aliasPath.replace(/^(npm:)/, '');
    const newPath = source.replace(moduleSplit.join('/'), aliasPath);

    // alias to npm module don't need relative mapping
    if (aliasPath[0] !== '.') {
        return newPath;
    }
    // relative alias
    return toLocalPath(toPosixPath(mapToRelative(cwd, file, newPath)));
}

export default ({ types: t }) => {
    function transformRequireCall(nodePath, state, cwd) {
        const calleePath = nodePath.get('callee');
        if (
            !t.isIdentifier(calleePath.node, { name: 'require' }) &&
                !(
                    t.isMemberExpression(calleePath.node) &&
                    t.isIdentifier(calleePath.node.object, { name: 'require' })
                )
        ) {
            return;
        }

        const args = nodePath.get('arguments');
        if (!args.length) {
            return;
        }

        const moduleArg = args[0];
        if (moduleArg.node.type === 'StringLiteral') {
            const modulePath = mapModule(moduleArg.node.value, state.file.opts.filename, state.opts, cwd);
            if (modulePath) {
                nodePath.replaceWith(t.callExpression(
                    calleePath.node, [t.stringLiteral(modulePath)]
                ));
            }
        }
    }

    function transformImportCall(nodePath, state, cwd) {
        const source = nodePath.get('source');
        if (source.type === 'StringLiteral') {
            const modulePath = mapModule(source.node.value, state.file.opts.filename, state.opts, cwd);
            if (modulePath) {
                source.replaceWith(t.stringLiteral(modulePath));
            }
        }
    }

    return {
        manipulateOptions(babelOptions) {
            const findPluginOptions = babelOptions.plugins.find(plugin => plugin[0] === this)[1];
            if (findPluginOptions.root) {
                findPluginOptions.root = findPluginOptions.root.reduce((resolvedDirs, dirPath) => {
                    if (glob.hasMagic(dirPath)) {
                        return resolvedDirs.concat(glob.sync(dirPath));
                    }
                    return resolvedDirs.concat(dirPath);
                }, []);
            }

            this.customCWD = findPluginOptions.cwd;
        },

        pre(file) {
            if (this.customCWD === 'babelrc') {
                const startPath = (file.opts.filename === 'unknown')
                    ? './'
                    : file.opts.filename;

                const { file: babelFile } = findBabelConfig.sync(startPath);
                this.customCWD = babelFile
                    ? path.dirname(babelFile)
                    : null;
            }

            this.moduleResolverCWD = this.customCWD || process.cwd();
        },

        visitor: {
            CallExpression: {
                exit(nodePath, state) {
                    if (nodePath.node.seen) {
                        return;
                    }

                    transformRequireCall(nodePath, state, this.moduleResolverCWD);

                    // eslint-disable-next-line no-param-reassign
                    nodePath.node.seen = true;
                },
            },
            ImportDeclaration: {
                exit(nodePath, state) {
                    transformImportCall(nodePath, state, this.moduleResolverCWD);
                },
            },
        },
    };
};
