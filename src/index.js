import path from 'path';
import fs from 'fs';
import glob from 'glob';
import findBabelConfig from 'find-babel-config';
import getRealPath from './getRealPath';
import transformImportCall from './transformers/import';
import transformSystemImportCall from './transformers/systemImport';
import transformJestCalls from './transformers/jest';
import transformRequireCall from './transformers/require';

const defaultBabelExtensions = ['.js', '.jsx', '.es', '.es6'];
export const defaultExtensions = defaultBabelExtensions;

export function mapModule(sourcePath, currentFile, pluginOpts, cwd) {
  return getRealPath(sourcePath, currentFile, {
    cwd,
    pluginOpts,
    extensions: pluginOpts.extensions || defaultExtensions,
  });
}

export function manipulatePluginOptions(pluginOpts) {
  if (pluginOpts.root) {
    // eslint-disable-next-line no-param-reassign
    pluginOpts.root = pluginOpts.root.reduce((resolvedDirs, dirPath) => {
      if (glob.hasMagic(dirPath)) {
        return resolvedDirs.concat(
          glob.sync(dirPath).filter(p => fs.lstatSync(p).isDirectory()),
        );
      }
      return resolvedDirs.concat(dirPath);
    }, []);
  }

  return pluginOpts;
}

export default ({ types: t }) => ({
  manipulateOptions(babelOptions) {
    let findPluginOptions = babelOptions.plugins.find(plugin => plugin[0] === this)[1];
    findPluginOptions = manipulatePluginOptions(findPluginOptions);

    this.customCWD = findPluginOptions.cwd;
  },

  pre(file) {
    let { customCWD } = this.plugin;
    if (customCWD === 'babelrc') {
      const startPath = (file.opts.filename === 'unknown')
        ? './'
        : file.opts.filename;

      const { file: babelFile } = findBabelConfig.sync(startPath);
      customCWD = babelFile
        ? path.dirname(babelFile)
        : null;
    }

    this.moduleResolverCWD = customCWD || process.cwd();
  },

  visitor: {
    CallExpression: {
      exit(nodePath, state) {
        if (nodePath.node.seen) {
          return;
        }

        transformRequireCall(t, nodePath, mapModule, state, this.moduleResolverCWD);
        transformJestCalls(t, nodePath, mapModule, state, this.moduleResolverCWD);
        transformSystemImportCall(t, nodePath, mapModule, state, this.moduleResolverCWD);

        // eslint-disable-next-line no-param-reassign
        nodePath.node.seen = true;
      },
    },
    ImportDeclaration: {
      exit(nodePath, state) {
        transformImportCall(t, nodePath, mapModule, state, this.moduleResolverCWD);
      },
    },
  },
});
