import path from 'path';
import glob from 'glob';
import findBabelConfig from 'find-babel-config';
import getRealPath from './getRealPath';

const defaultBabelExtensions = ['.js', '.jsx', '.es', '.es6'];

export const defaultExtensions = defaultBabelExtensions;
export function mapModule(sourcePath, currentFile, pluginOpts, cwd) {
    // Do not map source starting with a dot
    if (sourcePath[0] === '.') {
        return null;
    }

    return getRealPath(sourcePath, currentFile, {
        cwd,
        pluginOpts,
        extensions: pluginOpts.extensions || defaultExtensions,
    });
}
export function manipulatePluginOptions(pluginOpts) {
    if (pluginOpts.root) {
        // eslint-disable-next-line no-param-reassign
        pluginOpts.root = pluginOpts.root.reduce((resolvedDirs, dirPath) => {
            if (glob.hasMagic(dirPath)) {
                return resolvedDirs.concat(glob.sync(dirPath));
            }
            return resolvedDirs.concat(dirPath);
        }, []);
    }

    return pluginOpts;
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
                    calleePath.node, [t.stringLiteral(modulePath)],
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

    function transformJestCalls(nodePath, state, cwd) {
        const calleePath = nodePath.get('callee');

        const jestMethods = [
            'genMockFromModule',
            'mock',
            'unmock',
        ];

        if (!(
            t.isMemberExpression(calleePath.node) &&
            t.isIdentifier(calleePath.node.object, { name: 'jest' }) &&
            jestMethods.some(methodName => t.isIdentifier(calleePath.node.property, { name: methodName }))
        )) {
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
                const newArgs = [...args].map(a => a.node);
                newArgs[0] = t.stringLiteral(modulePath);
                nodePath.replaceWith(t.callExpression(
                    calleePath.node, newArgs,
                ));
            }
        }
    }

    function transformSystemImportCall(nodePath, state, cwd) {
        const calleePath = nodePath.get('callee');

        if (!(
            t.isMemberExpression(calleePath.node) &&
            t.isIdentifier(calleePath.node.object, { name: 'System' }) &&
            t.isIdentifier(calleePath.node.property, { name: 'import' })
        )) {
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
                    calleePath.node, [t.stringLiteral(modulePath)],
                ));
            }
        }
    }

    return {
        manipulateOptions(babelOptions) {
            let findPluginOptions = babelOptions.plugins.find(plugin => plugin[0] === this)[1];
            findPluginOptions = manipulatePluginOptions(findPluginOptions);

            this.customCWD = findPluginOptions.cwd;
        },

        pre(file) {
            let { customCWD } = this.plugin;
            if (customCWD === 'babelrc') {
                const startPath = (file.opts.filename === 'unknown')
                    ? './'
                    : file.opts.filename;

                const { file: babelFile } = findBabelConfig.sync(startPath);
                customCWD = babelFile
                    ? path.dirname(babelFile)
                    : null;
            }

            this.moduleResolverCWD = customCWD || process.cwd();
        },

        visitor: {
            CallExpression: {
                exit(nodePath, state) {
                    if (nodePath.node.seen) {
                        return;
                    }

                    transformRequireCall(nodePath, state, this.moduleResolverCWD);
                    transformJestCalls(nodePath, state, this.moduleResolverCWD);
                    transformSystemImportCall(nodePath, state, this.moduleResolverCWD);

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
