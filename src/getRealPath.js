import path from 'path';
import resolve from 'resolve';
import { toLocalPath, toPosixPath, replaceExtension } from './utils';
import mapToRelative from './mapToRelative';

function findPathInRoots(sourcePath, rootDirs, cwd, extensions) {
  // Search the source path inside every custom root directory
  let resolvedSourceFile;
  rootDirs.some((dir) => {
    try {
      // check if the file exists (will throw if not)
      resolvedSourceFile = resolve.sync(`./${sourcePath}`, {
        basedir: path.resolve(cwd, dir),
        extensions,
      });
      return true;
    } catch (e) {
      return false;
    }
  });

  return resolvedSourceFile;
}

function getRealPathFromRootConfig(sourcePath, absCurrentFile, rootDirs, cwd, extensions) {
  const absFileInRoot = findPathInRoots(sourcePath, rootDirs, cwd, extensions);

  if (absFileInRoot) {
    const realSourceFileExtension = path.extname(absFileInRoot);
    const sourceFileExtension = path.extname(sourcePath);

    // map the source and keep its extension if the import/require had one
    const ext = realSourceFileExtension === sourceFileExtension ? realSourceFileExtension : '';
    return toLocalPath(toPosixPath(replaceExtension(
      mapToRelative(cwd, absCurrentFile, absFileInRoot),
      ext,
    )));
  }

  return null;
}

function getRealPathFromAliasConfig(sourcePath, absCurrentFile, alias, cwd) {
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

  return toLocalPath(toPosixPath(mapToRelative(cwd, absCurrentFile, newPath)));
}

function getRealPathFromRegExpConfig(sourcePath, regExps) {
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

export default function getRealPath(sourcePath, currentFile, opts) {
  if (sourcePath[0] === '.') {
    return sourcePath;
  }

  // file param is a relative path from the environment current working directory
  // (not from cwd param)
  const absCurrentFile = path.resolve(currentFile);

  const { cwd, extensions, pluginOpts } = opts;
  const rootDirs = pluginOpts.root || [];
  const regExps = pluginOpts.regExps;
  const alias = pluginOpts.alias || {};

  const sourceFileFromAlias = getRealPathFromAliasConfig(
    sourcePath, absCurrentFile, alias, cwd,
  );
  if (sourceFileFromAlias) {
    return sourceFileFromAlias;
  }

  const sourceFileFromRegExp = getRealPathFromRegExpConfig(
    sourcePath, regExps,
  );
  if (sourceFileFromRegExp) {
    return sourceFileFromRegExp;
  }

  const sourceFileFromRoot = getRealPathFromRootConfig(
    sourcePath, absCurrentFile, rootDirs, cwd, extensions,
  );
  if (sourceFileFromRoot) {
    return sourceFileFromRoot;
  }

  return sourcePath;
}
