import fs from 'fs';
import path from 'path';
import { createSelector } from 'reselect';

import findBabelConfig from 'find-babel-config';
import glob from 'glob';
import pkgUp from 'pkg-up';


const defaultExtensions = ['.js', '.jsx', '.es', '.es6', '.mjs'];
const defaultTransformedFunctions = [
  'require',
  'require.resolve',
  'System.import',
  'jest.genMockFromModule',
  'jest.mock',
  'jest.unmock',
  'jest.doMock',
  'jest.dontMock',
];

function isRegExp(string) {
  return string.startsWith('^') || string.endsWith('$');
}

const specialCwd = {
  babelrc: startPath => findBabelConfig.sync(startPath).file,
  packagejson: startPath => pkgUp.sync(startPath),
};

function normalizeCwd(optsCwd, currentFile) {
  let cwd;

  if (optsCwd in specialCwd) {
    const startPath = (currentFile === 'unknown')
      ? './'
      : currentFile;

    const computedCwd = specialCwd[optsCwd](startPath);

    cwd = computedCwd
      ? path.dirname(computedCwd)
      : null;
  } else {
    cwd = optsCwd;
  }

  return cwd || process.cwd();
}

function normalizeRoot(optsRoot, cwd) {
  if (!optsRoot) {
    return [];
  }

  const rootArray = Array.isArray(optsRoot)
    ? optsRoot
    : [optsRoot];

  return rootArray
    .map(dirPath => path.resolve(cwd, dirPath))
    .reduce((resolvedDirs, absDirPath) => {
      if (glob.hasMagic(absDirPath)) {
        const roots = glob.sync(absDirPath)
          .filter(resolvedPath => fs.lstatSync(resolvedPath).isDirectory());

        return [...resolvedDirs, ...roots];
      }

      return [...resolvedDirs, absDirPath];
    }, []);
}

function getAliasPair(key, value) {
  const parts = value.split('\\\\');

  function substitute(execResult) {
    return parts
      .map(part =>
        part.replace(/\\\d+/g, number => execResult[number.slice(1)] || ''),
      )
      .join('\\');
  }

  return [new RegExp(key), substitute];
}

function normalizeAlias(optsAlias) {
  if (!optsAlias) {
    return [];
  }

  const aliasKeys = Object.keys(optsAlias);

  return aliasKeys.map(key => (
    isRegExp(key) ?
      getAliasPair(key, optsAlias[key]) :
      getAliasPair(`^${key}(/.*|)$`, `${optsAlias[key]}\\1`)
  ));
}

function normalizeTransformedFunctions(optsTransformFunctions) {
  if (!optsTransformFunctions) {
    return defaultTransformedFunctions;
  }

  return [...defaultTransformedFunctions, ...optsTransformFunctions];
}

export default createSelector(
  // The currentFile should have an extension; otherwise it's considered a special value
  currentFile => (currentFile.includes('.') ? path.dirname(currentFile) : currentFile),
  (_, opts) => opts,
  (currentFile, opts) => {
    const cwd = normalizeCwd(opts.cwd, currentFile);
    const root = normalizeRoot(opts.root, cwd);
    const alias = normalizeAlias(opts.alias);
    const transformFunctions = normalizeTransformedFunctions(opts.transformFunctions);
    const extensions = opts.extensions || defaultExtensions;

    return {
      cwd,
      root,
      alias,
      transformFunctions,
      extensions,
    };
  },
);
