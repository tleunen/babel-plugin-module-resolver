import path from 'path';
import resolve from 'resolve';
import mapToRelative from './mapToRelative';

function createAliasFileMap(pluginOpts) {
    const alias = pluginOpts.alias || {};
    return Object.keys(alias).reduce((memo, expose) => (
        Object.assign(memo, {
            [expose]: alias[expose]
        })
    ), {});
}

function replaceExt(p, ext) {
    const filename = path.basename(p, path.extname(p)) + ext;
    return path.join(path.dirname(p), filename);
}

const defaultBabelExtensions = ['.js', '.jsx', '.es', '.es6'];

export function mapModule(source, file, pluginOpts) {
    // Do not map source starting with a dot
    if (source[0] === '.') {
        return null;
    }

    // Search the file under the custom root directories
    const rootDirs = pluginOpts.root || [];
    for (let i = 0; i < rootDirs.length; i++) {
        try {
            // check if the file exists (will throw if not)
            const extensions = pluginOpts.extensions || defaultBabelExtensions;
            const fileAbsPath = resolve.sync(`./${source}`, { basedir: path.resolve(rootDirs[i]), extensions });
            const realFileExt = path.extname(fileAbsPath);
            const sourceFileExt = path.extname(source);
            // map the source and keep its extension if the import/require had one
            const ext = realFileExt === sourceFileExt ? realFileExt : '';
            return mapToRelative(file, replaceExt(fileAbsPath, ext));
        } catch (e) {
            // empty...
        }
    }

    // The source file wasn't found in any of the root directories. Lets try the alias
    const aliasMapping = createAliasFileMap(pluginOpts);
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
    return mapToRelative(file, newPath);
}


export default ({ types: t }) => {
    function transformRequireCall(nodePath, state) {
        if (
            !t.isIdentifier(nodePath.node.callee, { name: 'require' }) &&
                !(
                    t.isMemberExpression(nodePath.node.callee) &&
                    t.isIdentifier(nodePath.node.callee.object, { name: 'require' })
                )
        ) {
            return;
        }

        const moduleArg = nodePath.node.arguments[0];
        if (moduleArg && moduleArg.type === 'StringLiteral') {
            const modulePath = mapModule(moduleArg.value, state.file.opts.filename, state.opts);
            if (modulePath) {
                nodePath.replaceWith(t.callExpression(
                    nodePath.node.callee, [t.stringLiteral(modulePath)]
                ));
            }
        }
    }

    function transformImportCall(nodePath, state) {
        const moduleArg = nodePath.node.source;
        if (moduleArg && moduleArg.type === 'StringLiteral') {
            const modulePath = mapModule(moduleArg.value, state.file.opts.filename, state.opts);
            if (modulePath) {
                nodePath.replaceWith(t.importDeclaration(
                    nodePath.node.specifiers,
                    t.stringLiteral(modulePath)
                ));
            }
        }
    }

    return {
        visitor: {
            CallExpression: {
                exit(nodePath, state) {
                    return transformRequireCall(nodePath, state);
                }
            },
            ImportDeclaration: {
                exit(nodePath, state) {
                    return transformImportCall(nodePath, state);
                }
            }
        }
    };
};
