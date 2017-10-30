import normalizeOptions from './normalizeOptions';
import resolvePath from './resolvePath';
import transformCall from './transformers/call';
import transformImport from './transformers/import';


// Public API for external plugins
export { resolvePath };


const importVisitors = {
  CallExpression: transformCall,
  'ImportDeclaration|ExportDeclaration': transformImport,
};

const visitor = {
  Program: {
    enter(programPath, state) {
      programPath.traverse(importVisitors, state);
    },
  },
};

export default ({ types }) => ({
  name: 'module-resolver',
  pre(file) {
    this.types = types;

    const currentFile = file.opts.filename;
    this.normalizedOpts = normalizeOptions(currentFile, this.opts);
  },

  visitor,
});
