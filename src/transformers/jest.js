export default function transformJestCalls(t, nodePath, mapper, state, cwd) {
    const calleePath = nodePath.get('callee');

    const jestMethods = [
        'genMockFromModule',
        'mock',
        'unmock',
        'doMock',
        'dontMock',
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
        const modulePath = mapper(moduleArg.node.value, state.file.opts.filename, state.opts, cwd);
        if (modulePath) {
            const newArgs = [...args].map(a => a.node);
            newArgs[0] = t.stringLiteral(modulePath);
            nodePath.replaceWith(t.callExpression(
                calleePath.node, newArgs,
            ));
        }
    }
}
