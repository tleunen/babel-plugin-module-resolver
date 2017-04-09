import normalizeOptions from './normalizeOptions';
import transformCall from './transformers/call';
import transformImport from './transformers/import';


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
