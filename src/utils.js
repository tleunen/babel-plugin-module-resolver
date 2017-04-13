import path from 'path';

import resolve from 'resolve';
import getRealPath from './getRealPath';


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

export function replaceExtension(modulePath, ext) {
  const filename = path.basename(modulePath, path.extname(modulePath)) + ext;
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

  const modulePath = getRealPath(nodePath.node.value, state);
  if (modulePath) {
    nodePath.replaceWith(state.types.stringLiteral(modulePath));
  }
}
