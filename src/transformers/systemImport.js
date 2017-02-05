export default function transformSystemImportCall(t, nodePath, mapper, state, cwd) {
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
    const modulePath = mapper(moduleArg.node.value, state.file.opts.filename, state.opts, cwd);
    if (modulePath) {
      nodePath.replaceWith(t.callExpression(
        calleePath.node, [t.stringLiteral(modulePath)],
      ));
    }
  }
}
