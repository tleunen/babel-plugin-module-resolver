import getRealPath from './getRealPath';
import normalizeOptions from './normalizeOptions';
import transformCall from './transformers/call';
import transformImport from './transformers/import';


// Public API for external plugins
export {
  getRealPath,
  normalizeOptions,
};


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
  pre(file) {
    this.types = types;

    const currentFile = file.opts.filename;
    this.opts = normalizeOptions(currentFile, this.opts);
  },

  visitor,
});
