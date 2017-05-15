import normalizeOptions from './normalizeOptions';
import transformCall from './transformers/call';
import transformImport from './transformers/import';


const importVisitors = {
  CallExpression: transformCall,
  'ImportDeclaration|ExportDeclaration': transformImport,
};

const visitor = {
  Program: {
    exit(programPath, state) {
      programPath.traverse(importVisitors, state);
    },
  },
};

export default ({ types }) => ({
  pre(file) {
    this.types = types;
    normalizeOptions(this.opts, file);
  },

  visitor,
});
