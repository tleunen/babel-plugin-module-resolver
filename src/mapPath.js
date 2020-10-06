import defaultResolvePath from './resolvePath';

export default function mapPathString(nodePath, state, resolveOpts) {
  if (!state.types.isStringLiteral(nodePath)) {
    return;
  }

  const sourcePath = nodePath.node.value;
  const currentFile = state.file.opts.filename;
  const resolvePath = state.normalizedOpts.customResolvePath || defaultResolvePath;

  const modulePath = resolvePath(sourcePath, currentFile, state.opts, resolveOpts);
  if (modulePath) {
    if (nodePath.node.pathResolved) {
      return;
    }

    nodePath.replaceWith(state.types.stringLiteral(modulePath));
    nodePath.node.pathResolved = true;
  }
}
