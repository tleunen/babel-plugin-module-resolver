import path from 'path';

import { warn } from './log';
import mapToRelative from './mapToRelative';
import normalizeOptions from './normalizeOptions';
import { nodeResolvePath, replaceExtension, toLocalPath, toPosixPath } from './utils';


function findPathInRoots(sourcePath, { extensions, root }) {
  // Search the source path inside every custom root directory
  let resolvedSourceFile;

  root.some((basedir) => {
    resolvedSourceFile = nodeResolvePath(`./${sourcePath}`, basedir, extensions);
    return resolvedSourceFile !== null;
  });

  return resolvedSourceFile;
}

function resolvePathFromRootConfig(sourcePath, currentFile, opts) {
  const absFileInRoot = findPathInRoots(sourcePath, opts);

  if (!absFileInRoot) {
    return null;
  }

  const realSourceFileExtension = path.extname(absFileInRoot);
  const sourceFileExtension = path.extname(sourcePath);

  // Map the source and keep its extension if the import/require had one
  const ext = realSourceFileExtension === sourceFileExtension ? realSourceFileExtension : '';
  return toLocalPath(toPosixPath(replaceExtension(
    mapToRelative(opts.cwd, currentFile, absFileInRoot),
    ext,
    opts,
  )));
}

function checkIfPackageExists(modulePath, currentFile, extensions) {
  const resolvedPath = nodeResolvePath(modulePath, currentFile, extensions);
  if (resolvedPath === null) {
    warn(`Could not resolve "${modulePath}" in file ${currentFile}.`);
  }
}

function resolvePathFromAliasConfig(sourcePath, currentFile, opts) {
  let aliasedSourceFile;

  opts.alias.find(([regExp, substitute]) => {
    const execResult = regExp.exec(sourcePath);

    if (execResult === null) {
      return false;
    }

    aliasedSourceFile = substitute(execResult);
    return true;
  });

  if (!aliasedSourceFile) {
    return null;
  }

  if (aliasedSourceFile[0] === '.') {
    return toLocalPath(toPosixPath(
      mapToRelative(opts.cwd, currentFile, aliasedSourceFile)),
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    checkIfPackageExists(aliasedSourceFile, currentFile, opts.extensions);
  }

  return aliasedSourceFile;
}

const resolvers = [
  resolvePathFromRootConfig,
  resolvePathFromAliasConfig,
];

export default function resolvePath(sourcePath, currentFile, opts) {
  if (sourcePath[0] === '.') {
    return sourcePath;
  }

  const normalizedOpts = normalizeOptions(currentFile, opts);

  // File param is a relative path from the environment current working directory
  // (not from cwd param)
  const absoluteCurrentFile = path.resolve(currentFile);
  let resolvedPath = null;

  resolvers.some((resolver) => {
    resolvedPath = resolver(sourcePath, absoluteCurrentFile, normalizedOpts);
    return resolvedPath !== null;
  });

  return resolvedPath;
}
