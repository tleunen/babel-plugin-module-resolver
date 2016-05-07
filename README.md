# babel-plugin-module-alias [![Build Status][ci-image]][ci-url] [![Coverage Status][coverage-image]][coverage-url]

A [babel](http://babeljs.io) plugin to rewrite (map, alias, resolve) directories as different directories during the Babel process. It's particularly useful when you have files you don't want to use with relative paths (especially in big projects).

## Description

Instead of using relative paths in your project, you'll be able to use an alias. Here an simple example:
```js
// Instead of using this;
import MyUtilFn from '../../../../utils/MyUtilFn';
// Use that:
import MyUtilFn from 'utils/MyUtilFn';
```
With this plugin, you'll be able to map files or directories to the path you want.

_Note:_ It also work for `require()`.

_Note 2:_ You can use the `npm:` prefix in your plugin configuration to map a node module.


## Usage

Install the plugin

```
$ npm install --save babel babel-plugin-module-alias
```

Specify the plugin in your `.babelrc` with the custom mapping.
```json
{
  "plugins": [
    ["module-alias", [
      { "src": "./src/utils", "expose": "utils" },
      { "src": "./src/components", "expose": "awesome/components" },
      { "src": "npm:lodash", "expose": "underscore" }
    ]]
  ]
}
```

If you're using [eslint-plugin-import][eslint-plugin-import], you should use [eslint-import-resolver-babel-module-alias][resolver-module-alias] to avoid having false errors.

## License

MIT, see [LICENSE.md](/LICENSE.md) for details.


[ci-image]: https://circleci.com/gh/tleunen/babel-plugin-module-alias.svg?style=shield
[ci-url]: https://circleci.com/gh/tleunen/babel-plugin-module-alias
[coverage-image]: https://codecov.io/gh/tleunen/babel-plugin-module-alias/branch/master/graph/badge.svg
[coverage-url]: https://codecov.io/gh/tleunen/babel-plugin-module-alias
[resolver-module-alias]: https://github.com/tleunen/eslint-import-resolver-babel-module-alias
[eslint-plugin-import]: https://github.com/benmosher/eslint-plugin-import
