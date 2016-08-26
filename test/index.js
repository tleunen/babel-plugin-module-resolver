/* eslint-env mocha */
/* eslint-disable prefer-arrow-callback  */
/* eslint-disable func-names  */
import assert from 'assert';
import { transform } from 'babel-core'; // eslint-disable-line import/no-extraneous-dependencies
import plugin from '../src';

function testRequireImport(source, output, transformerOpts) {
    it('with a require statement', function () {
        const code = `var something = require("${source}");`;
        const result = transform(code, transformerOpts);

        assert.strictEqual(result.code, `var something = require("${output}");`);
    });

    it('with an import statement', function () {
        const code = `import something from "${source}";`;
        const result = transform(code, transformerOpts);

        assert.strictEqual(result.code, `import something from "${output}";`);
    });
}

describe('root', function () {
    const transformerOpts = {
        plugins: [
            [plugin, {
                root: ['./test/examples/components']
            }]
        ]
    };

    const transformerOptsGlob = {
        plugins: [
            [plugin, {
                root: ['./test/**/components']
            }]
        ]
    };

    describe('should rewrite the file path inside a root directory', function () {
        testRequireImport(
            'c1',
            './test/examples/components/c1',
            transformerOpts
        );
    });

    describe('should rewrite the sub file path inside a root directory', function () {
        testRequireImport(
            'sub/sub1',
            './test/examples/components/sub/sub1',
            transformerOpts
        );
    });

    describe('should rewrite the file while keeping the extension', function () {
        testRequireImport(
            'sub/sub1.css',
            './test/examples/components/sub/sub1.css',
            transformerOpts
        );
    });

    describe('should rewrite the file with a filename containing a dot', function () {
        testRequireImport(
            'sub/custom.modernizr3',
            './test/examples/components/sub/custom.modernizr3',
            transformerOpts
        );
    });

    describe('should not rewrite a path outisde of the root directory', function () {
        testRequireImport(
            'example-file',
            'example-file',
            transformerOpts
        );
    });

    describe('should rewrite the file path inside a root directory according to glob', function () {
        testRequireImport(
            'c1',
            './test/examples/components/c1',
            transformerOptsGlob
        );
    });
});

describe('alias', function () {
    const transformerOpts = {
        plugins: [
            [plugin, {
                alias: {
                    utils: './src/mylib/subfolder/utils',
                    'awesome/components': './src/components',
                    abstract: 'npm:concrete',
                    underscore: 'lodash'
                }
            }]
        ]
    };

    describe('should alias a known path', function () {
        describe('using a simple exposed name', function () {
            describe('when requiring the exact name', function () {
                testRequireImport(
                    'utils',
                    './src/mylib/subfolder/utils',
                    transformerOpts
                );
            });

            describe('when requiring a sub file of the exposed name', function () {
                testRequireImport(
                    'utils/my-util-file',
                    './src/mylib/subfolder/utils/my-util-file',
                    transformerOpts
                );
            });
        });

        describe('using a "complex" exposed name', function () {
            describe('when requiring the exact name', function () {
                testRequireImport(
                    'awesome/components',
                    './src/components',
                    transformerOpts
                );
            });

            describe('when requiring a sub file of the exposed name', function () {
                testRequireImport(
                    'awesome/components/my-comp',
                    './src/components/my-comp',
                    transformerOpts
                );
            });
        });

        describe('with a dot in the filename', function () {
            testRequireImport(
                'utils/custom.modernizr3',
                './src/mylib/subfolder/utils/custom.modernizr3',
                transformerOpts
            );
        });
    });

    describe('should alias the path with its extension', function () {
        testRequireImport(
            'awesome/components/my-comp.css',
            './src/components/my-comp.css',
            transformerOpts
        );
    });

    describe('should not alias a unknown path', function () {
        describe('when requiring a node module', function () {
            testRequireImport(
                'other-lib',
                'other-lib',
                transformerOpts
            );
        });

        describe('when requiring a specific un-mapped file', function () {
            testRequireImport(
                './l/otherLib',
                './l/otherLib',
                transformerOpts
            );
        });
    });

    describe('(legacy) should support aliasing a node module with "npm:"', function () {
        testRequireImport(
            'abstract/thing',
            'concrete/thing',
            transformerOpts
        );
    });

    describe('should support aliasing a node modules', function () {
        testRequireImport(
            'underscore/map',
            'lodash/map',
            transformerOpts
        );
    });
});
