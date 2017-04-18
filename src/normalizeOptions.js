import fs from 'fs';
import path from 'path';

import findBabelConfig from 'find-babel-config';
import glob from 'glob';
import pkgUp from 'pkg-up';

const defaultExtensions = ['.js', '.jsx', '.es', '.es6'];

function isRegExp(string) {
  return string.startsWith('^') || string.endsWith('$');
}

function normalizeCwd(opts, file) {
  if (opts.cwd === 'babelrc') {
    const startPath = (file.opts.filename === 'unknown')
      ? './'
      : file.opts.filename;

    const { file: babelPath } = findBabelConfig.sync(startPath);

    opts.cwd = babelPath
      ? path.dirname(babelPath)
      : null;
  } else if (opts.cwd === 'packagejson') {
    const startPath = (file.opts.filename === 'unknown')
      ? './'
      : file.opts.filename;

    const pkgPath = pkgUp.sync(startPath);

    opts.cwd = pkgPath
      ? path.dirname(pkgPath)
      : null;
  }
  if (!opts.cwd) {
    opts.cwd = process.cwd();
  }
}

function normalizeRoot(opts) {
  if (opts.root) {
    if (!Array.isArray(opts.root)) {
      opts.root = [opts.root];
    }
    opts.root = opts.root
      .map(dirPath => path.resolve(opts.cwd, dirPath))
      .reduce((resolvedDirs, absDirPath) => {
        if (glob.hasMagic(absDirPath)) {
          const roots = glob.sync(absDirPath)
            .filter(resolvedPath => fs.lstatSync(resolvedPath).isDirectory());

          return [...resolvedDirs, ...roots];
        }

        return [...resolvedDirs, absDirPath];
      }, []);
  } else {
    opts.root = [];
  }
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

function normalizeAlias(opts) {
  if (opts.alias) {
    const { alias } = opts;
    const aliasKeys = Object.keys(alias);

    opts.alias = aliasKeys.map(key => (
      isRegExp(key) ?
        getAliasPair(key, alias[key]) :
        getAliasPair(`^${key}((?:/|).*)`, `${alias[key]}\\1`)
    ));
  } else {
    opts.alias = [];
  }
}

export default function normalizeOptions(opts, file) {
  normalizeCwd(opts, file); // This has to go first because other options rely on cwd
  normalizeRoot(opts);
  normalizeAlias(opts);

  if (!opts.extensions) {
    opts.extensions = defaultExtensions;
  }
}
