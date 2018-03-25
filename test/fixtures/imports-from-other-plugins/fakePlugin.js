module.exports = function fakePlugin({ types }) {
  return {
    name: 'fake-plugin',
    visitor: {
      Identifier(path) {
        if (path.node.name === 'bootest') {
          path.replaceWith(types.Import());
        }
      },
    },
  };
};
