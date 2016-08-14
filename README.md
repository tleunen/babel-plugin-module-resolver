# babel-plugin-module-resolver
[![npm][npm-version-image]][npm-url] [![Build Status][ci-image]][ci-url] [![Coverage Status][coverage-image]][coverage-url]

A [babel](http://babeljs.io) plugin to add a new resolver for your modules when compiling your code using Babel. The plugin allows you to add new "root" directories that contains your modules. It also allows your to setup custom alias which can also be directories or specific files, or even other npm modules.

## Description

The reason of this plugin is to simplify the require/import paths in your project. Therefore, instead of using complex relative paths like `../../../../utils/my-utils`, you would be able to write `utils/my-utils`. It will allow you to work faster since you won't need to calculate how many levels of directory you have to go up before accessing the file.

Here's a full example:
```js
// Instead of using this;
import MyUtilFn from '../../../../utils/MyUtilFn';
// Use that:
import MyUtilFn from 'utils/MyUtilFn';
```

_Note:_ It also work for `require()`.

_Note 2:_ You can use the `npm:` prefix in your plugin configuration to map a node module.


## Usage

Install the plugin

```
$ npm install --save-dev babel-plugin-module-resolver
```


Specify the plugin in your `.babelrc` with the custom root or alias. Here's an example:
```json
{
  "plugins": [
    "transform-object-rest-spread",
      ["module-resolver", {
        "root": ["./src"],
        "alias": {
          "test": "./test"
        }
      }]
    ]
}
```

## ESLint plugin

If you're using ESLint, you should use the [eslint-plugin-import][eslint-plugin-import], and this [eslint-import-resolver-babel-module][eslint-import-resolver-babel-module] in order to remove falsy unresolved modules.

## Editors autocompletion

- Atom: Uses [atom-autocomplete-modules][atom-autocomplete-modules] and enable the `babel-plugin-module-resolver` option.
- IntelliJ/WebStorm: You can add custom resources root directories, make sure it matches what you have in this plugin.

## License

MIT, see [LICENSE.md](/LICENSE.md) for details.


[ci-image]: https://circleci.com/gh/tleunen/babel-plugin-module-resolver.svg?style=shield
[ci-url]: https://circleci.com/gh/tleunen/babel-plugin-module-resolver
[coverage-image]: https://codecov.io/gh/tleunen/babel-plugin-module-resolver/branch/master/graph/badge.svg
[coverage-url]: https://codecov.io/gh/tleunen/babel-plugin-module-resolver
[npm-version-image]: https://img.shields.io/npm/v/babel-plugin-module-resolver.svg
[npm-url]: https://www.npmjs.com/package/babel-plugin-module-resolver
[eslint-import-resolver-babel-module]: https://github.com/tleunen/eslint-import-resolver-babel-module
[eslint-plugin-import]: https://github.com/benmosher/eslint-plugin-import
[atom-autocomplete-modules]: https://github.com/nkt/atom-autocomplete-modules
