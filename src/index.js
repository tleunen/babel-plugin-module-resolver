const path = require('path');

function createFilesMap(state) {
    const result = {};
    let opts = state.opts;
    if(!Array.isArray(opts)) {
        opts = [opts];
    }

    opts.forEach(moduleMapData => {
        result[moduleMapData.expose] = moduleMapData.src;
    });

    return result;
}

export function mapToRelative(currentFile, module) {
    let from = path.dirname(currentFile);
    let to = path.normalize(module);

    from = path.isAbsolute(from) ? from : path.resolve(process.cwd(), from);
    to = path.isAbsolute(to) ? to : path.resolve(process.cwd(), to);

    let moduleMapped = path.relative(from, to);

    if(moduleMapped[0] !== '.') moduleMapped = './' + moduleMapped;
    return moduleMapped;
}

function mapModule(modulePath, state, filesMap) {
    const moduleSplit = modulePath.split('/');

    if(!filesMap.hasOwnProperty(moduleSplit[0])) {
        return null;
    }

    moduleSplit[0] = filesMap[moduleSplit[0]];
    return mapToRelative(state.file.opts.filename, moduleSplit.join('/'));
}


export default ({ types: t }) => {
    function transformRequireCall(nodePath, state, filesMap) {
        if(
            !t.isIdentifier(nodePath.node.callee, { name: 'require' }) &&
                !(
                    t.isMemberExpression(nodePath.node.callee) &&
                    t.isIdentifier(nodePath.node.callee.object, { name: 'require' })
                )
        ) {
            return null;
        }

        const moduleArg = nodePath.node.arguments[0];
        if(moduleArg && moduleArg.type === 'StringLiteral') {
            const modulePath = mapModule(moduleArg.value, state, filesMap);
            if(modulePath) {
                nodePath.replaceWith(t.callExpression(
                    nodePath.node.callee, [t.stringLiteral(modulePath)]
                ));
            }
        }
    }

    function transformImportCall(nodePath, state, filesMap) {
        const moduleArg = nodePath.node.source;
        if(moduleArg && moduleArg.type === 'StringLiteral') {
            const modulePath = mapModule(moduleArg.value, state, filesMap);
            if(modulePath) {
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
                    return transformRequireCall(nodePath, state, createFilesMap(state));
                }
            },
            ImportDeclaration: {
                exit(nodePath, state) {
                    return transformImportCall(nodePath, state, createFilesMap(state));
                }
            }
        }
    };
};
