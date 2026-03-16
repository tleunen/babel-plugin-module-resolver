import fs from 'fs';
import path from 'path';

import findBabelConfig from 'find-babel-config';
import findPackageJson from './findPackageJson';

import { escapeRegExp } from './utils';

const defaultExtensions = ['.js', '.jsx', '.es', '.es6', '.mjs'];
const defaultTransformedFunctions = [
  'require',
  'require.resolve',
  'System.import',

  // Jest methods
  'jest.genMockFromModule',
  'jest.mock',
  'jest.unmock',
  'jest.doMock',
  'jest.dontMock',
  'jest.setMock',
  'jest.requireActual',
  'jest.requireMock',

  // vitest methods
  'vi.mock',
  'vi.doMock',
  'vi.importActual',
  'vi.importMock',
  'vi.unmock',
  'vi.doUnmock',

  // Older Jest methods
  'require.requireActual',
  'require.requireMock',
];

function isRegExp(string) {
  return string.startsWith('^') || string.endsWith('$');
}

const specialCwd = {
  babelrc: (startPath) => findBabelConfig.sync(startPath).file,
  packagejson: (startPath) => findPackageJson(startPath),
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

function hasGlobMagic(pattern) {
  return /[*?[\]{}]|(^|[^\\])[@?!+*]\(/.test(pattern);
}

function normalizeRoot(optsRoot, cwd) {
  if (!optsRoot) {
    return [];
  }

  const rootArray = Array.isArray(optsRoot) ? optsRoot : [optsRoot];

  return rootArray
    .map((dirPath) => path.resolve(cwd, dirPath))
    .reduce((resolvedDirs, absDirPath) => {
      if (hasGlobMagic(absDirPath)) {
        const roots = fs
          .globSync(absDirPath)
          .filter((resolvedPath) => fs.lstatSync(resolvedPath).isDirectory());

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
        return value.map((v) => `${v}${match}`);
      }
      return `${value}${match}`;
    };
  }

  const parts = value.split('\\\\');

  return (execResult) =>
    parts
      .map((part) => part.replace(/\\\d+/g, (number) => execResult[number.slice(1)] || ''))
      .join('\\');
}

function normalizeAlias(optsAlias) {
  if (!optsAlias) {
    return [];
  }

  const aliasArray = Array.isArray(optsAlias) ? optsAlias : [optsAlias];

  return aliasArray.reduce((aliasPairs, alias) => {
    const aliasKeys = Object.keys(alias);

    aliasKeys.forEach((key) => {
      const isKeyRegExp = isRegExp(key);
      aliasPairs.push([
        getAliasTarget(key, isKeyRegExp),
        getAliasSubstitute(alias[key], isKeyRegExp),
      ]);
    });

    return aliasPairs;
  }, []);
}

function normalizeTransformedFunctions(optsTransformFunctions) {
  if (!optsTransformFunctions) {
    return defaultTransformedFunctions;
  }

  return [...defaultTransformedFunctions, ...optsTransformFunctions];
}

function normalizeLoglevel(optsLoglevel) {
  return optsLoglevel || 'warn';
}

function getCacheKey(currentFile) {
  return currentFile.includes('.') ? path.dirname(currentFile) : currentFile;
}

function computeNormalizedOptions(currentFile, opts) {
  const cwd = normalizeCwd(opts.cwd, currentFile);
  const root = normalizeRoot(opts.root, cwd);
  const alias = normalizeAlias(opts.alias);
  const loglevel = normalizeLoglevel(opts.loglevel);
  const transformFunctions = normalizeTransformedFunctions(opts.transformFunctions);
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

let lastCacheKey;
let lastOpts;
let lastResult;
let recomputations = 0;

function normalizeOptions(currentFile, opts) {
  const cacheKey = getCacheKey(currentFile);

  if (cacheKey === lastCacheKey && opts === lastOpts) {
    return lastResult;
  }

  lastCacheKey = cacheKey;
  lastOpts = opts;
  lastResult = computeNormalizedOptions(cacheKey, opts);
  recomputations += 1;

  return lastResult;
}

normalizeOptions.recomputations = () => recomputations;
normalizeOptions.resetRecomputations = () => {
  lastCacheKey = undefined;
  lastOpts = undefined;
  lastResult = undefined;
  recomputations = 0;
};

export default normalizeOptions;
