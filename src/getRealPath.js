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

function getRealPathFromAliasConfig(sourcePath, currentFile, { alias, cwd }) {
  const moduleSplit = sourcePath.split('/');
  let aliasPath;

  while (moduleSplit.length) {
    const m = moduleSplit.join('/');
    if ({}.hasOwnProperty.call(alias, m)) {
      aliasPath = alias[m];
      break;
    }
    moduleSplit.pop();
  }

  // no alias mapping found
  if (!aliasPath) {
    return null;
  }

  // remove legacy "npm:" prefix for npm packages
  aliasPath = aliasPath.replace(/^(npm:)/, '');
  const newPath = sourcePath.replace(moduleSplit.join('/'), aliasPath);

  // alias to npm module don't need relative mapping
  if (aliasPath[0] !== '.') {
    return newPath;
  }

  return toLocalPath(toPosixPath(mapToRelative(cwd, currentFile, newPath)));
}

function getRealPathFromRegExpConfig(sourcePath, currentFile, { regExps }) {
  let aliasedSourceFile;

  regExps.find(([regExp, substitute]) => {
    const execResult = regExp.exec(sourcePath);

    if (execResult === null) {
      return false;
    }

    aliasedSourceFile = substitute(execResult);
    return true;
  });

  return aliasedSourceFile;
}

const resolvers = [
  getRealPathFromRootConfig,
  getRealPathFromAliasConfig,
  getRealPathFromRegExpConfig,
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
