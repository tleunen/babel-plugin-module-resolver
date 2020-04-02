import fs from 'fs';
import path from 'path';
import { createSelector } from 'reselect';

import findBabelConfig from 'find-babel-config';
import glob from 'glob';
import pkgUp from 'pkg-up';

import { escapeRegExp } from './utils';

const defaultExtensions = ['.js', '.jsx', '.es', '.es6', '.mjs'];
const defaultTransformFunctions = [
  { pattern: 'require', isModulePath: true },
  { pattern: 'require.resolve', isModulePath: true },
  { pattern: 'System.import', isModulePath: true },

  // Jest methods
  { pattern: 'jest.genMockFromModule', isModulePath: true },
  { pattern: 'jest.mock', isModulePath: true },
  { pattern: 'jest.unmock', isModulePath: true },
  { pattern: 'jest.doMock', isModulePath: true },
  { pattern: 'jest.dontMock', isModulePath: true },
  { pattern: 'jest.setMock', isModulePath: true },
  { pattern: 'require.requireActual', isModulePath: true },
  { pattern: 'require.requireMock', isModulePath: true },
];

function isRegExp(string) {
  return string.startsWith('^') || string.endsWith('$');
}

const specialCwd = {
  babelrc: startPath => findBabelConfig.sync(startPath).file,
  packagejson: startPath => pkgUp.sync({ cwd: startPath }),
};

function normalizeCwd(optsCwd, currentFile) {
  let cwd;

  if (optsCwd in specialCwd) {
    const startPath = currentFile === 'unknown' ? './' : currentFile;

    const computedCwd = specialCwd[optsCwd](startPath);

    cwd = computedCwd ? path.dirname(computedCwd) : null;
  } else {
    cwd = optsCwd;
  }

  return cwd || process.cwd();
}

function normalizeRoot(optsRoot, cwd) {
  if (!optsRoot) {
    return [];
  }

  const rootArray = Array.isArray(optsRoot) ? optsRoot : [optsRoot];

  return rootArray
    .map(dirPath => path.resolve(cwd, dirPath))
    .reduce((resolvedDirs, absDirPath) => {
      if (glob.hasMagic(absDirPath)) {
        const roots = glob
          .sync(absDirPath)
          .filter(resolvedPath => fs.lstatSync(resolvedPath).isDirectory());

        return [...resolvedDirs, ...roots];
      }

      return [...resolvedDirs, absDirPath];
    }, []);
}

function getAliasTarget(key, isKeyRegExp) {
  const regExpPattern = isKeyRegExp ? key : `^${escapeRegExp(key)}(/.*|)$`;
  return new RegExp(regExpPattern);
}

function getAliasSubstitute(value, isKeyRegExp) {
  if (typeof value === 'function') {
    return value;
  }

  if (!isKeyRegExp) {
    return ([, match]) => {
      // Alias with array of paths
      if (Array.isArray(value)) {
        return value.map(v => `${v}${match}`);
      }
      return `${value}${match}`;
    };
  }

  const parts = value.split('\\\\');

  return execResult =>
    parts
      .map(part => part.replace(/\\\d+/g, number => execResult[number.slice(1)] || ''))
      .join('\\');
}

function normalizeAlias(optsAlias) {
  if (!optsAlias) {
    return [];
  }

  const aliasArray = Array.isArray(optsAlias) ? optsAlias : [optsAlias];

  return aliasArray.reduce((aliasPairs, alias) => {
    const aliasKeys = Object.keys(alias);

    aliasKeys.forEach(key => {
      const isKeyRegExp = isRegExp(key);
      aliasPairs.push([
        getAliasTarget(key, isKeyRegExp),
        getAliasSubstitute(alias[key], isKeyRegExp),
      ]);
    });

    return aliasPairs;
  }, []);
}

function normalizeTransformFunctionsElement(optsTransformFunction) {
  let pattern;
  let opts;
  if (Array.isArray(optsTransformFunction)) {
    [pattern, opts] = optsTransformFunction;
  } else {
    [pattern, opts] = [optsTransformFunction, {}];
  }

  const finalOpts = { pattern, isModulePath: true };
  if (opts.isModulePath !== undefined) {
    finalOpts.isModulePath = opts.isModulePath;
  }

  return finalOpts;
}

function normalizeTransformFunctions(optsTransformFunctions) {
  if (!optsTransformFunctions) {
    return defaultTransformFunctions;
  }

  return [...defaultTransformFunctions,
    ...optsTransformFunctions.map(normalizeTransformFunctionsElement)];
}

function normalizeLoglevel(optsLoglevel) {
  return optsLoglevel || 'warn';
}

export default createSelector(
  // The currentFile should have an extension; otherwise it's considered a special value
  currentFile => (currentFile.includes('.') ? path.dirname(currentFile) : currentFile),
  (_, opts) => opts,
  (currentFile, opts) => {
    const cwd = normalizeCwd(opts.cwd, currentFile);
    const root = normalizeRoot(opts.root, cwd);
    const alias = normalizeAlias(opts.alias);
    const loglevel = normalizeLoglevel(opts.loglevel);
    const transformFunctions = normalizeTransformFunctions(opts.transformFunctions);
    const extensions = opts.extensions || defaultExtensions;
    const stripExtensions = opts.stripExtensions || extensions;

    return {
      cwd,
      root,
      alias,
      loglevel,
      transformFunctions,
      extensions,
      stripExtensions,
      customResolvePath: opts.resolvePath,
    };
  }
);
