import path from 'path';

import resolve from 'resolve';


export function nodeResolvePath(modulePath, basedir, extensions) {
  try {
    return resolve.sync(modulePath, { basedir, extensions });
  } catch (e) {
    return null;
  }
}

export function toPosixPath(modulePath) {
  return modulePath.replace(/\\/g, '/');
}

export function toLocalPath(modulePath) {
  return modulePath
    .replace(/\/index$/, '') // remove trailing /index
    .replace(/^(?!\.)/, './'); // insert `./` to make it a local path
}

export function stripExtension(modulePath, extensions) {
  const [name, ...splits] = path.basename(modulePath).split('.');
  const fileExtension = `.${splits.join('.')}`;
  return extensions.reduce((filename, extension) => {
    // To allow filename to contain a dot
    if (extension === fileExtension) {
      // Strip extension
      return name;
    }
    return filename;
  }, path.basename(modulePath, path.extname(modulePath)));
}

export function replaceExtension(modulePath, ext, opts) {
  const filename = stripExtension(modulePath, opts.extensions) + ext;
  return path.join(path.dirname(modulePath), filename);
}

export function matchesPattern(types, calleePath, pattern) {
  const { node } = calleePath;

  if (types.isMemberExpression(node)) {
    return calleePath.matchesPattern(pattern);
  }

  if (!types.isIdentifier(node) || pattern.includes('.')) {
    return false;
  }

  const name = pattern.split('.')[0];

  return node.name === name;
}

export function mapPathString(nodePath, state) {
  if (!state.types.isStringLiteral(nodePath)) {
    return;
  }

  const sourcePath = nodePath.node.value;
  const currentFile = state.file.opts.filename;

  const modulePath = state.normalizedOpts.resolvePath(sourcePath, currentFile, state.opts);
  if (modulePath) {
    if (nodePath.node.pathResolved) {
      return;
    }

    nodePath.replaceWith(state.types.stringLiteral(modulePath));
    nodePath.node.pathResolved = true;
  }
}

export function isImportCall(types, calleePath) {
  return types.isImport(calleePath.node.callee);
}
