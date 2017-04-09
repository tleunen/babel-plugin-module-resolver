import normalizeOptions from './normalizeOptions';
import transformCall from './transformers/call';
import transformImport from './transformers/import';


export default ({ types }) => {
  const importVisitors = {
    CallExpression(nodePath, state) {
      transformCall(nodePath, state);
    },
    ImportDeclaration(nodePath, state) {
      transformImport(nodePath, state);
    },
    ExportDeclaration(nodePath, state) {
      transformImport(nodePath, state);
    },
  };

  return {
    pre(file) {
      this.types = types;
      normalizeOptions(this.opts, file);
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
