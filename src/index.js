const path = require('path');

function createFilesMap(state) {
    const result = {};
    const opts = Array.isArray(state.opts)
        ? state.opts
        : [state.opts];

    opts.forEach(moduleMapData => {
        result[moduleMapData.expose] = moduleMapData.src;
    });

    return result;
}

function resolve(filename) {
    if (path.isAbsolute(filename)) return filename;
    return path.resolve(process.cwd(), filename);
}

function toPosixPath(modulePath) {
    return modulePath.replace(/\\/g, '/');
}

export function mapToRelative(currentFile, module) {
    let from = path.dirname(currentFile);
    let to = path.normalize(module);

    from = resolve(from);
    to = resolve(to);

    let moduleMapped = path.relative(from, to);

    moduleMapped = toPosixPath(moduleMapped);

    // Support npm modules instead of directories
    if (moduleMapped.indexOf('npm:') !== -1) {
        const [, npmModuleName] = moduleMapped.split('npm:');
        return npmModuleName;
    }

    if (moduleMapped[0] !== '.') moduleMapped = `./${moduleMapped}`;

    return moduleMapped;
}

export function mapModule(source, file, filesMap) {
    const moduleSplit = source.split('/');

    let src;
    while (moduleSplit.length) {
        const m = moduleSplit.join('/');
        if (filesMap.hasOwnProperty(m)) {
            src = filesMap[m];
            break;
        }
        moduleSplit.pop();
    }

    if (!moduleSplit.length) {
        // no mapping available
        return null;
    }

    const newPath = source.replace(moduleSplit.join('/'), src);
    return mapToRelative(file, newPath);
}


export default ({ types: t }) => {
    function transformRequireCall(nodePath, state, filesMap) {
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
            const modulePath = mapModule(moduleArg.value, state.file.opts.filename, filesMap);
            if (modulePath) {
                nodePath.replaceWith(t.callExpression(
                    nodePath.node.callee, [t.stringLiteral(modulePath)]
                ));
            }
        }
    }

    function transformImportCall(nodePath, state, filesMap) {
        const moduleArg = nodePath.node.source;
        if (moduleArg && moduleArg.type === 'StringLiteral') {
            const modulePath = mapModule(moduleArg.value, state.file.opts.filename, filesMap);
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
