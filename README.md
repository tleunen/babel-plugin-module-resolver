# babel-plugin-module-resolver
[![Maintenance Status][status-image]][status-url] [![NPM version][npm-image]][npm-url] [![Build Status Linux][circleci-image]][circleci-url] [![Build Status Windows][appveyor-image]][appveyor-url] [![Coverage Status][coverage-image]][coverage-url]

A [Babel](http://babeljs.io) plugin to add a new resolver for your modules when compiling your code using Babel. This plugin allows you to add new "root" directories that contain your modules. It also allows you to setup a custom alias for directories, specific files, or even other npm modules.

## Description

This plugin can simplify the require/import paths in your project. For example, instead of using complex relative paths like `../../../../utils/my-utils`, you can write `utils/my-utils`. It will allow you to work faster since you won't need to calculate how many levels of directory you have to go up before accessing the file.

```js
// Use this:
import MyUtilFn from 'utils/MyUtilFn';
// Instead of that:
import MyUtilFn from '../../../../utils/MyUtilFn';

// And it also work with require calls
// Use this:
const MyUtilFn = require('utils/MyUtilFn');
// Instead of that:
const MyUtilFn = require('../../../../utils/MyUtilFn');
```

## Usage

Install the plugin

```
$ npm install --save-dev babel-plugin-module-resolver
```

Specify the plugin in your `.babelrc` with the custom root or alias. Here's an example:
```json
{
  "plugins": [
    ["module-resolver", {
      "root": ["./src"],
      "alias": {
        "test": "./test",
        "underscore": "lodash"
      }
    }]
  ]
}
```

Are you a plugin author (e.g. IDE integration)? We have [documented the exposed functions](#for-plugin-authors) for use in your plugins!

### Options

- `root`: A string or an array of root directories. Specify the paths or a glob path (eg. `./src/**/components`)
- `alias`: A map of alias. You can also alias node_modules dependencies, not just local files.
- `extensions`: An array of extensions used in the resolver. Override the default extensions (`['.js', '.jsx', '.es', '.es6', '.mjs']`).
- `cwd`: By default, the working directory is the one used for the resolver, but you can override it for your project.
    - The custom value `babelrc` will make the plugin look for the closest babelrc configuration based on the file to parse.
    - The custom value `packagejson` will make the plugin look for the closest `package.json` based on the file to parse.
- `transformFunctions`: Array of functions and methods that will have their first argument transformed. By default those methods are: `require`, `require.resolve`, `System.import`, `jest.genMockFromModule`, `jest.mock`, `jest.unmock`, `jest.doMock`, `jest.dontMock`.

### Regular expression alias

It is possible to specify an alias using a regular expression. To do that, either start an alias with `'^'` or end it with `'$'`:

```json
{
  "plugins": [
    ["module-resolver", {
      "alias": {
        "^@namespace/foo-(.+)": "packages/\\1"
      }
    }]
  ]
}
```

Using the config from this example `'@namespace/foo-bar'` will become `'packages/bar'`.

You can reference the n-th matched group with `'\\n'` (`'\\0'` refers to the whole matched path).

To use the backslash character (`\`) just escape it like so: `'\\\\'` (double escape is needed because of JSON already using `\` for escaping).

## ESLint plugin

If you're using ESLint, you should use [eslint-plugin-import][eslint-plugin-import], and [eslint-import-resolver-babel-module][eslint-import-resolver-babel-module] to remove falsy unresolved modules.

## Usage with Flow

To allow Flow to find your modules, add configuration options
to `.flowconfig`.

For example, a React component is located at `src/components/Component.js`

```js
// Before
import '../../src/components/Component';

// After - Flow cannot find this now
import 'components/Component';
```

Instruct Flow where to resolve modules from:

```
# .flowconfig

[options]
module.system.node.resolve_dirname=node_modules
module.system.node.resolve_dirname=src
```

Be sure to add any sub-directories if you refer to files further down the
directory tree:

```js
// Located at src/store/actions
import 'actions/User'
```
```
module.system.node.resolve_dirname=src/store
```

Or you may use `name_mapper` option for manual listing (tested with Flow 0.45):

```diff
# .flowconfig

[options]
; Be careful with escaping characters in regexp
- module.name_mapper='^app\/(.*)$' -> '<PROJECT_ROOT>/app/\1' # does not work
+ module.name_mapper='^app\/\(.*\)$' -> '<PROJECT_ROOT>/app/\1' # work as expected

; Other modules
module.name_mapper='^i18n\/\(.*\)$' -> '<PROJECT_ROOT>/i18n/\1'
module.name_mapper='^schema\/\(.*\)$' -> '<PROJECT_ROOT>/schema/\1'
module.name_mapper='^mongoose-elasticsearch-xp\(.*\)$' -> '<PROJECT_ROOT>/lib/mongoose-elasticsearch-xp\1'
```

More configuration options are located in [the Flow documentation](https://flowtype.org/docs/advanced-configuration.html)

## Editors autocompletion

- Atom: Uses [atom-autocomplete-modules][atom-autocomplete-modules] and enable the `babel-plugin-module-resolver` option.
- IntelliJ/WebStorm: You can add custom resources root directories, make sure it matches what you have in this plugin.

## For plugin authors

Aside from the main export, which is the plugin itself as needed by Babel, there is a function used internally that is exposed:

```js
import { resolvePath } from 'babel-plugin-module-resolver';

// `opts` are the options as passed to the Babel config (should have keys like "root", "alias", etc.)
const realPath = resolvePath(sourcePath, currentFile, opts);
```

For each path in the file you can use `resolvePath` to get the same path that module-resolver will output.

`currentFile` can be either a relative path (will be resolved with respect to the CWD, not `opts.cwd`), or an absolute path.

## License

MIT, see [LICENSE.md](/LICENSE.md) for details.


[status-image]: https://img.shields.io/badge/status-maintained-brightgreen.svg
[status-url]: https://github.com/tleunen/babel-plugin-module-resolver

[npm-image]: https://img.shields.io/npm/v/babel-plugin-module-resolver.svg
[npm-url]: https://www.npmjs.com/package/babel-plugin-module-resolver

[circleci-image]: https://img.shields.io/circleci/project/tleunen/babel-plugin-module-resolver/master.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSItMTQyLjUgLTE0Mi41IDI4NSAyODUiPjxjaXJjbGUgcj0iMTQxLjciIGZpbGw9IiNERDQ4MTQiLz48ZyBpZD0iYSIgZmlsbD0iI0ZGRiI%2BPGNpcmNsZSBjeD0iLTk2LjQiIHI9IjE4LjkiLz48cGF0aCBkPSJNLTQ1LjYgNjguNGMtMTYuNi0xMS0yOS0yOC0zNC00Ny44IDYtNSA5LjgtMTIuMyA5LjgtMjAuNnMtMy44LTE1LjctOS44LTIwLjZjNS0xOS44IDE3LjQtMzYuNyAzNC00Ny44bDEzLjggMjMuMkMtNDYtMzUuMi01NS4zLTE4LjctNTUuMyAwYzAgMTguNyA5LjMgMzUuMiAyMy41IDQ1LjJ6Ii8%2BPC9nPjx1c2UgeGxpbms6aHJlZj0iI2EiIHRyYW5zZm9ybT0icm90YXRlKDEyMCkiLz48dXNlIHhsaW5rOmhyZWY9IiNhIiB0cmFuc2Zvcm09InJvdGF0ZSgyNDApIi8%2BPC9zdmc%2B
[circleci-url]: https://circleci.com/gh/tleunen/babel-plugin-module-resolver

[appveyor-image]: https://img.shields.io/appveyor/ci/tleunen/babel-plugin-module-resolver/master.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjEyOCIgaGVpZ2h0PSIxMjgiIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48ZyBmaWxsPSIjMUJBMUUyIiB0cmFuc2Zvcm09InNjYWxlKDgpIj48cGF0aCBkPSJNMCAyLjI2NWw2LjUzOS0uODg4LjAwMyA2LjI4OC02LjUzNi4wMzd6Ii8%2BPHBhdGggZD0iTTYuNTM2IDguMzlsLjAwNSA2LjI5My02LjUzNi0uODk2di01LjQ0eiIvPjxwYXRoIGQ9Ik03LjMyOCAxLjI2MWw4LjY3LTEuMjYxdjcuNTg1bC04LjY3LjA2OXoiLz48cGF0aCBkPSJNMTYgOC40NDlsLS4wMDIgNy41NTEtOC42Ny0xLjIyLS4wMTItNi4zNDV6Ii8%2BPC9nPjwvc3ZnPg==
[appveyor-url]: https://ci.appveyor.com/project/tleunen/babel-plugin-module-resolver

[coverage-image]: https://codecov.io/gh/tleunen/babel-plugin-module-resolver/branch/master/graph/badge.svg
[coverage-url]: https://codecov.io/gh/tleunen/babel-plugin-module-resolver

[eslint-import-resolver-babel-module]: https://github.com/tleunen/eslint-import-resolver-babel-module
[eslint-plugin-import]: https://github.com/benmosher/eslint-plugin-import
[atom-autocomplete-modules]: https://github.com/nkt/atom-autocomplete-modules
