# Module alias plugin for Babel

A [babel](http://babeljs.io) plugin to easily map directories as different directories when your required a module.
Useful when you don't want to write relative path yourself.


## Usage

Instead of writing `var m = require('../../../../utils/myUtils')` or `import m from '../../../../myUtils'. You could just use `var m = require('utils/myUtils')` or the equivalent ES6 import `import m from 'utils/myUtils'.

To do so, first install babel and the plugin
```
$ npm install --save babel babel-plugin-module-alias
```

Then, the recommended way of using it is by using the file `.babelrc` to setup the configuration for Babel.
```
{
  "plugins": [
    "babel-plugin-module-alias"
  ],
  "extra": {
    "module-alias": [
      { "src": "./src/utils", "expose": "utils" }
    ]
  }
}
```
_Note:_ the section `extra` is a custom section commonly used by plugins to take options. There's currently no better way in Babel to pass options to plugins.

## License

MIT, see [LICENSE.md](/LICENSE.md) for details.
