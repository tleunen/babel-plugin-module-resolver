import path from 'path';

import { transform } from 'babel-core';
import plugin from '../src';


describe('module-resolver', () => {
  function testWithImport(source, output, transformerOpts) {
    const code = `import something from "${source}";`;
    const result = transform(code, transformerOpts);

    expect(result.code).toBe(`import something from "${output}";`);
  }

  describe('root', () => {
    describe('simple root', () => {
      const rootTransformerOpts = {
        babelrc: false,
        plugins: [
          [plugin, {
            root: './test/testproject/src',
          }],
        ],
      };

      it('should resolve the file path', () => {
        testWithImport(
          'app',
          './test/testproject/src/app',
          rootTransformerOpts,
        );
      });

      it('should resolve the sub file path', () => {
        testWithImport(
          'components/Root',
          './test/testproject/src/components/Root',
          rootTransformerOpts,
        );
      });

      it('should resolve a sub file path without /index', () => {
        testWithImport(
          'components/Header',
          './test/testproject/src/components/Header',
          rootTransformerOpts,
        );
      });

      it('should resolve the file path while keeping the extension', () => {
        testWithImport(
          'components/Header/header.css',
          './test/testproject/src/components/Header/header.css',
          rootTransformerOpts,
        );
      });

      it('should resolve the file path with an extension that is non-standard in node', () => {
        testWithImport(
          'es6module',
          './test/testproject/src/es6module',
          rootTransformerOpts,
        );
      });

      it('should not resolve the file path with an unknown extension', () => {
        testWithImport(
          'text',
          'text',
          rootTransformerOpts,
        );
      });

      it('should resolve the file path with a filename containing a dot', () => {
        testWithImport(
          'libs/custom.modernizr3',
          './test/testproject/src/libs/custom.modernizr3',
          rootTransformerOpts,
        );
      });

      it('should resolve to a file instead of a directory', () => {
        // When a file and a directory on the same level share the same name,
        // the file has priority according to the Node require mechanism
        testWithImport(
          'constants',
          '../constants',
          {
            ...rootTransformerOpts,
            filename: './test/testproject/src/constants/actions.js',
          },
        );
      });

      it('should not resolve a path outside of the root directory', () => {
        testWithImport(
          'lodash/omit',
          'lodash/omit',
          rootTransformerOpts,
        );
      });

      it('should not try to resolve a local path', () => {
        testWithImport(
          './something',
          './something',
          rootTransformerOpts,
        );
      });
    });

    describe('multiple roots', () => {
      const rootTransformerOpts = {
        babelrc: false,
        plugins: [
          [plugin, {
            root: [
              './test/testproject/src/actions',
              './test/testproject/src/components',
            ],
          }],
        ],
      };

      it('should resolve the file sub path in root 1', () => {
        testWithImport(
          'something',
          './test/testproject/src/actions/something',
          rootTransformerOpts,
        );
      });

      it('should resolve the file sub path in root 2', () => {
        testWithImport(
          'Root',
          './test/testproject/src/components/Root',
          rootTransformerOpts,
        );
      });
    });

    describe('glob root', () => {
      const globRootTransformerOpts = {
        babelrc: false,
        plugins: [
          [plugin, {
            root: './test/testproject/src/**',
          }],
        ],
      };

      it('should resolve the file path right inside the glob', () => {
        testWithImport(
          'app',
          './test/testproject/src/app',
          globRootTransformerOpts,
        );
      });

      it('should resolve the sub file path', () => {
        testWithImport(
          'actions/something',
          './test/testproject/src/actions/something',
          globRootTransformerOpts,
        );
      });

      it('should resolve the sub file path without specifying the directory', () => {
        testWithImport(
          'something',
          './test/testproject/src/actions/something',
          globRootTransformerOpts,
        );
      });

      it('should resolve the deep file', () => {
        testWithImport(
          'SidebarFooterButton',
          './test/testproject/src/components/Sidebar/Footer/SidebarFooterButton',
          globRootTransformerOpts,
        );
      });
    });

    describe('non-standard extensions', () => {
      const rootTransformerOpts = {
        babelrc: false,
        plugins: [
          [plugin, {
            root: './test/testproject/src',
            extensions: ['.txt'],
          }],
        ],
      };

      it('should not resolve the file path with an unknown extension', () => {
        testWithImport(
          'app',
          'app',
          rootTransformerOpts,
        );
      });

      it('should resolve the file path with a known defined extension', () => {
        testWithImport(
          'text',
          './test/testproject/src/text',
          rootTransformerOpts,
        );
      });
    });

    describe('root and alias', () => {
      const rootTransformerOpts = {
        babelrc: false,
        plugins: [
          [plugin, {
            root: './test/testproject/src',
            alias: {
              constants: 'constants/actions',
            },
          }],
        ],
      };

      it('should resolve the path using root first and alias otherwise', () => {
        testWithImport(
          'constants',
          './test/testproject/src/constants',
          rootTransformerOpts,
        );
      });
    });
  });

  describe('alias', () => {
    const aliasTransformerOpts = {
      plugins: [
        [plugin, {
          alias: {
            test: './test/testproject/test',
            libs: './test/testproject/src/libs',
            components: './test/testproject/src/components',
            '~': './test/testproject/src',
            'awesome/components': './test/testproject/src/components',
            'babel-kernel': 'babel-core',
            '^@namespace/foo-(.+)': './packages/\\1',
            'styles/.+\\.(css|less|scss)$': './style-proxy.\\1',
            '^single-backslash': './pas\\\\sed',
            '^non-existing-match': './pas\\42sed',
            '^regexp-priority': './hit',
            'regexp-priority$': './miss',
            'regexp-priority': './miss',
          },
        }],
      ],
    };

    describe('with a simple alias', () => {
      it('should alias the file path', () => {
        testWithImport(
          'components',
          './test/testproject/src/components',
          aliasTransformerOpts,
        );
      });

      it('should alias the sub file path', () => {
        testWithImport(
          'test/tools',
          './test/testproject/test/tools',
          aliasTransformerOpts,
        );
      });
    });

    describe('with an alias containing a slash', () => {
      it('should alias the file path', () => {
        testWithImport(
          'awesome/components',
          './test/testproject/src/components',
          aliasTransformerOpts,
        );
      });

      it('should alias the sub file path', () => {
        testWithImport(
          'awesome/components/Header',
          './test/testproject/src/components/Header',
          aliasTransformerOpts,
        );
      });
    });

    it('should alias a path containing a dot in the filename', () => {
      testWithImport(
        'libs/custom.modernizr3',
        './test/testproject/src/libs/custom.modernizr3',
        aliasTransformerOpts,
      );
    });

    it('should alias the path with its extension', () => {
      testWithImport(
        'components/Header/header.css',
        './test/testproject/src/components/Header/header.css',
        aliasTransformerOpts,
      );
    });

    describe('should not alias a unknown path', () => {
      it('when requiring a node module', () => {
        testWithImport(
          'other-lib',
          'other-lib',
          aliasTransformerOpts,
        );
      });

      it('when requiring a specific un-mapped file', () => {
        testWithImport(
          './l/otherLib',
          './l/otherLib',
          aliasTransformerOpts,
        );
      });
    });

    it('should support aliasing a node module', () => {
      // If this test breaks, consider selecting another package used by the plugin
      testWithImport(
        'babel-kernel/register',
        'babel-core/register',
        aliasTransformerOpts,
      );
    });

    describe('with a regular expression', () => {
      it('should support replacing parts of a path', () => {
        testWithImport(
          '@namespace/foo-bar',
          './packages/bar',
          aliasTransformerOpts,
        );
      });

      it('should support replacing parts of a complex path', () => {
        testWithImport(
          '@namespace/foo-bar/component.js',
          './packages/bar/component.js',
          aliasTransformerOpts,
        );
      });

      describe('should support complex regular expressions', () => {
        ['css', 'less', 'scss'].forEach((extension) => {
          it(`should handle the alias with the ${extension} extension`, () => {
            testWithImport(
              `styles/style.${extension}`,
              `./style-proxy.${extension}`,
              aliasTransformerOpts,
            );
          });
        });
      });

      it('should ignore unmatched paths', () => {
        testWithImport(
          'styles/style.js',
          'styles/style.js',
          aliasTransformerOpts,
        );
      });

      it('should unescape a double backslash into a single one', () => {
        testWithImport(
          'single-backslash',
          // This is a string literal, so in the code it will actually be "pas\\sed"
          './pas/sed',
          aliasTransformerOpts,
        );
      });

      it('should replace missing matches with an empty string', () => {
        testWithImport(
          'non-existing-match',
          './passed',
          aliasTransformerOpts,
        );
      });

      it('should have higher priority than a simple alias', () => {
        testWithImport(
          'regexp-priority',
          './hit',
          aliasTransformerOpts,
        );
      });
    });

    describe('with the plugin applied twice', () => {
      const doubleAliasTransformerOpts = {
        plugins: [
          [plugin, { root: '.' }],
          [plugin, {
            alias: {
              '^@namespace/foo-(.+)': './packages/\\1',
            },
          }],
        ],
      };

      it('should support replacing parts of a path', () => {
        testWithImport(
          '@namespace/foo-bar',
          './packages/bar',
          doubleAliasTransformerOpts,
        );
      });
    });

    describe('missing packages warning', () => {
      const mockWarn = jest.fn();
      jest.mock('../src/log', () => ({
        warn: mockWarn,
      }));
      jest.resetModules();
      const pluginWithMock = require.requireActual('../src').default;
      const fileName = path.resolve('unknown');

      const missingAliasTransformerOpts = {
        plugins: [
          [pluginWithMock, {
            alias: {
              legacy: 'npm:legacy',
              'non-existing': 'this-package-does-not-exist',
            },
          }],
        ],
      };

      beforeEach(() => {
        mockWarn.mockClear();
        process.env.NODE_ENV = 'development';
      });

      it('should print a warning for a legacy alias', () => {
        testWithImport(
          'legacy/lib',
          'npm:legacy/lib',
          missingAliasTransformerOpts,
        );

        expect(mockWarn.mock.calls.length).toBe(1);
        expect(mockWarn).toBeCalledWith(`Could not resolve "npm:legacy/lib" in file ${fileName}.`);
      });

      it('should print a warning for an unresolved package', () => {
        testWithImport(
          'non-existing/lib',
          'this-package-does-not-exist/lib',
          missingAliasTransformerOpts,
        );

        expect(mockWarn.mock.calls.length).toBe(1);
        expect(mockWarn).toBeCalledWith(`Could not resolve "this-package-does-not-exist/lib" in file ${fileName}.`);
      });

      describe('production environment', () => {
        beforeEach(() => {
          process.env.NODE_ENV = 'production';
        });

        it('should print a warning for an unresolved package', () => {
          testWithImport(
            'non-existing/lib',
            'this-package-does-not-exist/lib',
            missingAliasTransformerOpts,
          );

          expect(mockWarn.mock.calls.length).toBe(0);
        });
      });
    });
  });

  describe('with custom cwd', () => {
    describe('custom value', () => {
      const transformerOpts = {
        babelrc: false,
        plugins: [
          [plugin, {
            root: './testproject/src',
            cwd: path.resolve('test'),
            alias: {
              constantsAlias: './constants',
              '^constantsRegExp(.*)': './constants\\1',
            },
          }],
        ],
      };

      it('should resolve the file path', () => {
        testWithImport(
          'components/Root',
          './test/testproject/src/components/Root',
          transformerOpts,
        );
      });

      it('should alias the relative path while honoring cwd', () => {
        testWithImport(
          'constantsAlias/actions',
          './test/constants/actions',
          transformerOpts,
        );
      });

      it('should alias the relative path while honoring cwd', () => {
        testWithImport(
          'constantsRegExp/actions',
          './test/constants/actions',
          transformerOpts,
        );
      });
    });

    describe('with root', () => {
      const transformerOpts = {
        babelrc: false,
        plugins: [
          [plugin, {
            root: './src',
            cwd: path.resolve('test/testproject'),
          }],
        ],
      };

      it('should resolve the sub file path', () => {
        testWithImport(
          'components/Root',
          './test/testproject/src/components/Root',
          transformerOpts,
        );
      });
    });

    describe('with glob root', () => {
      const transformerOpts = {
        babelrc: false,
        plugins: [
          [plugin, {
            root: './testproject/*',
            cwd: path.resolve('test'),
          }],
        ],
      };

      it('should resolve the sub file path', () => {
        testWithImport(
          'components/Root',
          './test/testproject/src/components/Root',
          transformerOpts,
        );
      });
    });
  });

  describe('babelrc', () => {
    const transformerOpts = {
      babelrc: false,
      plugins: [
        [plugin, {
          root: './src',
          alias: {
            test: './test',
          },
          cwd: 'babelrc',
        }],
      ],
      filename: './test/testproject/src/app.js',
    };

    it('should resolve the sub file path', () => {
      testWithImport(
        'components/Root',
        './components/Root',
        transformerOpts,
      );
    });

    it('should alias the sub file path', () => {
      testWithImport(
        'test/tools',
        '../test/tools',
        transformerOpts,
      );
    });

    describe('unknown filename', () => {
      const unknownFileTransformerOpts = {
        babelrc: false,
        plugins: [
          [plugin, {
            root: './src',
            cwd: 'babelrc',
          }],
        ],
      };
      const cachedCwd = process.cwd();
      const babelRcDir = 'test/testproject';

      beforeEach(() => {
        process.chdir(babelRcDir);
      });

      afterEach(() => {
        process.chdir(cachedCwd);
      });

      it('should resolve the sub file path', () => {
        testWithImport(
          'components/Root',
          './src/components/Root',
          unknownFileTransformerOpts,
        );
      });
    });

    describe('missing babelrc in path (uses cwd)', () => {
      jest.mock('find-babel-config', () => ({
        sync: function findBabelConfigSync() {
          return { file: null, config: null };
        },
      }));
      jest.resetModules();
      const pluginWithMock = require.requireActual('../src').default;

      const missingBabelConfigTransformerOpts = {
        babelrc: false,
        plugins: [
          [pluginWithMock, {
            root: '.',
            cwd: 'babelrc',
          }],
        ],
        filename: './test/testproject/src/app.js',
      };

      it('should resolve the sub file path', () => {
        testWithImport(
          'test/testproject/src/components/Root',
          './components/Root',
          missingBabelConfigTransformerOpts,
        );
      });
    });
  });

  describe('packagejson', () => {
    const transformerOpts = {
      babelrc: false,
      plugins: [
        [plugin, {
          root: './src',
          alias: {
            test: './test',
          },
          cwd: 'packagejson',
        }],
      ],
      filename: './test/testproject/src/app.js',
    };

    it('should resolve the sub file path', () => {
      testWithImport(
        'components/Root',
        './components/Root',
        transformerOpts,
      );
    });

    it('should alias the sub file path', () => {
      testWithImport(
        'test/tools',
        '../test/tools',
        transformerOpts,
      );
    });

    describe('unknown filename', () => {
      const unknownFileTransformerOpts = {
        babelrc: false,
        plugins: [
          [plugin, {
            root: './src',
            cwd: 'packagejson',
          }],
        ],
      };
      const cachedCwd = process.cwd();
      const pkgJsonDir = 'test/testproject';

      beforeEach(() => {
        process.chdir(pkgJsonDir);
      });

      afterEach(() => {
        process.chdir(cachedCwd);
      });

      it('should resolve the sub file path', () => {
        testWithImport(
          'components/Root',
          './src/components/Root',
          unknownFileTransformerOpts,
        );
      });
    });

    describe('missing packagejson in path (uses cwd)', () => {
      jest.mock('pkg-up', () => ({
        sync: function pkgUpSync() {
          return null;
        },
      }));
      jest.resetModules();
      const pluginWithMock = require.requireActual('../src').default;

      const missingPkgJsonConfigTransformerOpts = {
        babelrc: false,
        plugins: [
          [pluginWithMock, {
            root: '.',
            cwd: 'packagejson',
          }],
        ],
        filename: './test/testproject/src/app.js',
      };

      it('should resolve the sub file path', () => {
        testWithImport(
          'test/testproject/src/components/Root',
          './components/Root',
          missingPkgJsonConfigTransformerOpts,
        );
      });
    });
  });
});
