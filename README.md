# babel-plugin-module-alias [![Build Status](https://travis-ci.org/tleunen/babel-plugin-module-alias.svg?branch=master)](https://travis-ci.org/tleunen/babel-plugin-module-alias)

A [babel](http://babeljs.io) plugin to rewrite (map, alias) directories as different directories during the Babel process. It's particularly useful when you have files you don't want to use with relative paths (especially in big projects).

> Compatible Babel 6.x

## Description

Instead of having long relative paths inside your code, use custom names to easily import your code.

```js
// Instead of using this
import MyUtilFn from '../../../../utils/MyUtilFn';
// or this (because in another file for example)
import MyUtilFn from '../utils/MyUtilFn'

// always use this:
import MyUtilFn from 'utils/MyUtilFn';
```

_Note:_ It also works with the require statement (`var MyUtilFn = require('utils/MyUtilFn');`).

## Usage

Install the plugin

```
$ npm install --save babel babel-plugin-module-alias
```

Specify the plugin in your `.babelrc` and specify your custom alias mapping

Then, the recommended way of using it is by using the file `.babelrc` to setup the configuration for Babel.
```json
{
  "plugins": [
    ["babel-plugin-module-alias", [
      { "src": "./src/utils", "expose": "utils" },
      { "src": "./src/components", "expose": "components" }
    ]]
  ]
}
```

## License

MIT, see [LICENSE.md](/LICENSE.md) for details.
