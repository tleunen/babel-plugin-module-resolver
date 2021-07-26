* [Getting Started](#getting-started)
* [Options](#options)
  * [root](#root)
  * [alias](#alias)
  * [extensions](#extensions)
  * [stripExtensions](#stripExtensions)
  * [cwd](#cwd)
  * [transformFunctions](#transformfunctions)
  * [resolvePath](#resolvepath)
* [Usage with Create React App](#usage-with-create-react-app)
* [Usage with React Native](#usage-with-react-native)
* [Usage with Proxyquire](#usage-with-proxyquire)
* [Usage with Flow](#usage-with-flow)
* [For plugin authors](#for-plugin-authors)

# Getting Started

Install the plugin

```
npm install --save-dev babel-plugin-module-resolver
```
or
```
yarn add --dev babel-plugin-module-resolver
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

# Options

## root

A string or an array of root directories. Specify the paths or a glob path (eg. `./src/**/components`)
`node_modules` is an implicit root as it is a default directory to resolve modules

## alias

A map of alias. You can also alias `node_modules` dependencies, not just local files.

### Regular expressions

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

### Passing a substitute function

If you need even more power over the aliased path, you can pass a function in the alias configuration:

```js
module.exports = {
  plugins: [
    ["module-resolver", {
      alias: {
        "foo": ([, name]) => `bar${name}`,
        "^@namespace/foo-(.+)": ([, name]) => `packages/${name}`
      }
    }]
  ]
}
```

Using the config from this example:
* `'foo'` will become `'bar'` (`name` is empty)
* `'foo/baz'` will become `'bar/baz'` (`name` includes the slash in this case)
* `'@namespace/foo-bar'` will become `'packages/bar'`

The only argument is the result of calling `RegExp.prototype.exec` on the matched path. It's an array with the matched string and all matched groups.

Because the function is only called when there is a match, the argument can never be `null`.

## extensions

An array of extensions used in the resolver.

```json
{
  "plugins": [
    [
      "module-resolver",
      {
        "extensions": [".js", ".jsx", ".es", ".es6", ".mjs"]
      }
    ]
  ]
}
```

## stripExtensions

An array of extensions that will be stripped from file paths. Defaults to the `extensions` option value.

```json
{
  "plugins": [
    [
      "module-resolver",
      {
        "stripExtensions": [".js", ".jsx", ".es", ".es6", ".mjs"]
      }
    ]
  ]
}
```

## cwd

By default, the working directory is the one used for the resolver, but you can override it for your project.
* The custom value `babelrc` will make the plugin look for the closest babelrc configuration based on the file to parse.
```json
{
  "plugins": [
    ["module-resolver", {
      "cwd": "babelrc"
    }]
  ]
}
```
* The custom value `packagejson` will make the plugin look for the closest `package.json` based on the file to parse.
```json
{
  "plugins": [
    ["module-resolver", {
      "cwd": "packagejson"
    }]
  ]
}
```

## transformFunctions

Array of functions and methods that will have their first argument transformed. By default those methods are: `require`, `require.resolve`, `System.import`, `jest.genMockFromModule`, `jest.mock`, `jest.unmock`, `jest.doMock`, `jest.dontMock`.

```json
{
  "plugins": [
    ["module-resolver", {
      "transformFunctions": [
          "require",
          "require.resolve",
          "System.import",
          "jest.genMockFromModule",
          "jest.mock",
          "jest.unmock",
          "jest.doMock",
          "jest.dontMock"
      ]
    }]
  ]
}
```

## resolvePath

A function that is called to resolve each path in the project. By default `module-resolver` is using an internal function - the same one that's exported from the plugin itself (see [For plugin authors](#for-plugin-authors) for more info).

```js
module.exports = {
  plugins: [
    ["module-resolver", {
      extensions: [".js"],
      resolvePath(sourcePath, currentFile, opts) {
        /**
         * The `opts` argument is the options object that is passed through the Babel config.
         * opts = {
         *   extensions: [".js"],
         *   resolvePath: ...,
         * }
         */
        return "resolvedPath";
      }
    }]
  ]
}
```

If you want to leave some paths as-is, then you can return `undefined` or any other falsy value from the function.

## loglevel

One of the [NPM log level options](https://docs.npmjs.com/misc/config#loglevel) to configure console logging during build. Default is `"warn"`. Passing `"silent"` will disable all warnings for path resolution failures.

```js
module.exports = {
  plugins: [
    ["module-resolver", {
      alias: {
        "dependency-string": "module-that-does-not-exist" // warning will not log
      },
      loglevel: 'silent'
    }]
  ]
}
```

# Usage with create-react-app

create-react-app by default don't use .babelrc, so in webpack.config.dev.js, add plugins property within js loader like below. Note that plugins recieve an array.

```js
// Process JS with Babel.
{
  test: /\.(js|jsx|mjs)$/,
  include: paths.appSrc,
  loader: require.resolve('babel-loader'),
  options: {
    plugins: [
        ["module-resolver", {
        "root": ["./src/App"],
        "alias": {
          "test": "./test",
        }
      }]
    ],
    cacheDirectory: true
  }
}
```

# Usage with React Native

To let the packager resolve the right module for each platform, you have to add the ```.ios.js```and ```.android.js``` extensions :

```json
{
  "plugins": [
    [
      "module-resolver",
      {
        "root": ["./src"],
        "extensions": [".ios.js", ".android.js", ".js", ".json"]
      }
    ]
  ]
}
```

# Usage with Proxyquire

If you use the mocking library [proxyquire](https://github.com/thlorenz/proxyquire), or otherwise need to define path strings which aren't direct arguments to  `transformFunctions`, you have a problem: the plug-in won't convert them.

Because proxyquire expects paths not just as direct arguments, but also as object keys, simply adding proxyquire to `transformFunctions` isn't enough:

```js
const { functionToTest } = proxyquire('~/modifiedPathToTestedModule', { // this path will be converted
    '~/modifiedPathToDependency': { mockVersionOfDependency } // this path won't be converted
});
```

The solution in this case is to use or create a function like Lodash's/Underscore's `_.identity`, which simply returns its argument.  Next, add it to `transformFunctions`, and then use it to convert the problematic path string:

```json
"transformFunctions": [
    "proxyquire",
    "resolvePath"
]
```

```js
const resolvePath = x => x;
const { functionToTest } = proxyquire('~/modifiedPathToTestedModule', { // this path will be converted
    [resolvePath('~/modifiedPathToDependency')]: { mockVersionOfDependency } // this path will be converted
});
```

# Usage with Flow

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
module.system.node.resolve_dirname=./src
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

# For plugin authors

Aside from the main export, which is the plugin itself as needed by Babel, there is a function used internally that is exposed:

```js
import { resolvePath } from 'babel-plugin-module-resolver';

// `opts` are the options as passed to the Babel config (should have keys like "root", "alias", etc.)
const realPath = resolvePath(sourcePath, currentFile, opts);
```

For each path in the file you can use `resolvePath` to get the same path that module-resolver will output.

`currentFile` can be either a relative path (will be resolved with respect to the CWD, not `opts.cwd`), or an absolute path.
