module.exports = function fakePlugin({ types }) {
  return {
    visitor: {
      Identifier(path) {
        path.replaceWith(types.Import());
      },
    },
  };
};
