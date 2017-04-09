import path from 'path';

import resolve from 'resolve';
import mapToRelative from './mapToRelative';
import { toLocalPath, toPosixPath, replaceExtension } from './utils';


function findPathInRoots(sourcePath, { extensions, root }) {
  // Search the source path inside every custom root directory
  let resolvedSourceFile;

  root.some((basedir) => {
    try {
      // Check if the file exists (will throw if not)
      resolvedSourceFile = resolve.sync(`./${sourcePath}`, {
        basedir,
        extensions,
      });
      return true;
    } catch (e) {
      return false;
    }
  });

  return resolvedSourceFile;
}

function getRealPathFromRootConfig(sourcePath, currentFile, opts) {
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
  )));
}

function getRealPathFromAliasConfig(sourcePath, currentFile, opts) {
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
    aliasedSourceFile = toLocalPath(toPosixPath(
      mapToRelative(opts.cwd, currentFile, aliasedSourceFile)),
    );
  }

  return aliasedSourceFile;
}

const resolvers = [
  getRealPathFromRootConfig,
  getRealPathFromAliasConfig,
];

export default function getRealPath(sourcePath, { file, opts }) {
  if (sourcePath[0] === '.') {
    return sourcePath;
  }

  // File param is a relative path from the environment current working directory
  // (not from cwd param)
  const currentFile = path.resolve(file.opts.filename);
  let resolvedPath = null;

  resolvers.some((resolver) => {
    resolvedPath = resolver(sourcePath, currentFile, opts);
    return resolvedPath !== null;
  });

  return resolvedPath;
}
