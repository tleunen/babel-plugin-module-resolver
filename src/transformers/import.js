export default function transformImportCall(t, nodePath, mapper, state, cwd) {
  const source = nodePath.get('source');
  if (source.type === 'StringLiteral') {
    const modulePath = mapper(source.node.value, state.file.opts.filename, state.opts, cwd);
    if (modulePath) {
      source.replaceWith(t.stringLiteral(modulePath));
    }
  }
}
