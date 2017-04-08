import fs from 'fs';
import path from 'path';

import findBabelConfig from 'find-babel-config';
import glob from 'glob';
import transformCall from './transformers/call';
import transformImport from './transformers/import';


const defaultBabelExtensions = ['.js', '.jsx', '.es', '.es6'];
export const defaultExtensions = defaultBabelExtensions;

function isRegExp(string) {
  return string.startsWith('^') || string.endsWith('$');
}

// The working directory of Atom is the project,
// while Sublime sets the working project to the directory in which the current opened file is
// So we need to offer a way to customize the cwd for the eslint plugin
export function manipulatePluginOptions(pluginOpts, cwd = process.cwd()) {
  if (pluginOpts.root) {
    if (typeof pluginOpts.root === 'string') {
      pluginOpts.root = [pluginOpts.root]; // eslint-disable-line no-param-reassign
    }
    // eslint-disable-next-line no-param-reassign
    pluginOpts.root = pluginOpts.root.reduce((resolvedDirs, dirPath) => {
      if (glob.hasMagic(dirPath)) {
        return resolvedDirs.concat(
          glob.sync(dirPath, { cwd }).filter(p => fs.lstatSync(p).isDirectory()),
        );
      }
      return resolvedDirs.concat(dirPath);
    }, []);
  } else {
    // eslint-disable-next-line no-param-reassign
    pluginOpts.root = [];
  }

  // eslint-disable-next-line no-param-reassign
  pluginOpts.regExps = [];

  if (pluginOpts.alias) {
    Object.keys(pluginOpts.alias)
      .filter(isRegExp)
      .forEach((key) => {
        const parts = pluginOpts.alias[key].split('\\\\');

        function substitute(execResult) {
          return parts
            .map(part =>
              part.replace(/\\\d+/g, number => execResult[number.slice(1)] || ''),
            )
            .join('\\');
        }

        pluginOpts.regExps.push([new RegExp(key), substitute]);

        // eslint-disable-next-line no-param-reassign
        delete pluginOpts.alias[key];
      });
  } else {
    // eslint-disable-next-line no-param-reassign
    pluginOpts.alias = {};
  }

  if (!pluginOpts.extensions) {
    // eslint-disable-next-line no-param-reassign
    pluginOpts.extensions = defaultExtensions;
  }

  return pluginOpts;
}

export default ({ types }) => {
  const importVisitors = {
    CallExpression(nodePath, state) {
      transformCall(types, nodePath, state);
    },
    ImportDeclaration(nodePath, state) {
      transformImport(types, nodePath, state);
    },
    ExportDeclaration(nodePath, state) {
      transformImport(types, nodePath, state);
    },
  };

  return {
    pre(file) {
      manipulatePluginOptions(this.opts);

      let customCWD = this.opts.cwd;

      if (customCWD === 'babelrc') {
        const startPath = (file.opts.filename === 'unknown')
          ? './'
          : file.opts.filename;

        const { file: babelFile } = findBabelConfig.sync(startPath);
        customCWD = babelFile
          ? path.dirname(babelFile)
          : null;
      }

      this.cwd = customCWD || process.cwd();
    },

    visitor: {
      Program: {
        exit(programPath, state) {
          programPath.traverse(importVisitors, state);
        },
      },
    },
  };
};
