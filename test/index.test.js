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
            abstract: 'npm:concrete',
            underscore: 'lodash',
            prefix: 'prefix/lib',
            '^@namespace/foo-(.+)': 'packages/\\1',
            'styles/.+\\.(css|less|scss)$': 'style-proxy.\\1',
            '^single-backslash': 'pas\\\\sed',
            '^non-existing-match': 'pas\\42sed',
            '^regexp-priority': 'miss',
            'regexp-priority$': 'miss',
            'regexp-priority': 'hit',
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

    it('(legacy) should support aliasing a node module with "npm:"', () => {
      testWithImport(
        'abstract/thing',
        'concrete/thing',
        aliasTransformerOpts,
      );
    });

    it('should support aliasing a node modules', () => {
      testWithImport(
        'underscore/map',
        'lodash/map',
        aliasTransformerOpts,
      );
    });

    describe('with a regular expression', () => {
      it('should support replacing parts of a path', () => {
        testWithImport(
          '@namespace/foo-bar',
          'packages/bar',
          aliasTransformerOpts,
        );
      });

      it('should support replacing parts of a complex path', () => {
        testWithImport(
          '@namespace/foo-bar/component.js',
          'packages/bar/component.js',
          aliasTransformerOpts,
        );
      });

      describe('should support complex regular expressions', () => {
        ['css', 'less', 'scss'].forEach((extension) => {
          it(`should handle the alias with the ${extension} extension`, () => {
            testWithImport(
              `styles/style.${extension}`,
              `style-proxy.${extension}`,
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

      it('should transform double backslash into a single one', () => {
        testWithImport(
          'single-backslash',
          // This is a string literal, so in the code it will actually be "pas\\sed"
          'pas\\\\sed',
          aliasTransformerOpts,
        );
      });

      it('should replece missing matches with an empty string', () => {
        testWithImport(
          'non-existing-match',
          'passed',
          aliasTransformerOpts,
        );
      });

      it('should have higher priority than a simple alias', () => {
        testWithImport(
          'regexp-priority',
          'hit',
          aliasTransformerOpts,
        );
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
            alias: {
              test: './testproject/test',
            },
            cwd: path.join(process.cwd(), 'test'),
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

      it('should alias the sub file path', () => {
        testWithImport(
          'test/tools',
          './test/testproject/test/tools',
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
});
