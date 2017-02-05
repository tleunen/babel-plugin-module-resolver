export default function transformRequireCall(t, nodePath, mapper, state, cwd) {
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
    const modulePath = mapper(moduleArg.node.value, state.file.opts.filename, state.opts, cwd);
    if (modulePath) {
      nodePath.replaceWith(t.callExpression(
        calleePath.node, [t.stringLiteral(modulePath)],
      ));
    }
  }
}
