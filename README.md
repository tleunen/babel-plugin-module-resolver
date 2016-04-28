# babel-plugin-module-alias [![Build Status][travis-image]][travis-url] [![semantic-release][semantic-release-image]][semantic-release-url]

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

## License

MIT, see [LICENSE.md](/LICENSE.md) for details.


[travis-image]: https://travis-ci.org/tleunen/babel-plugin-module-alias.svg?branch=master
[travis-url]: https://travis-ci.org/tleunen/babel-plugin-module-alias
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
