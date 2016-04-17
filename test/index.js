/* eslint-env mocha */
import path from 'path';
import assert from 'assert';
import { transform } from 'babel-core';
import plugin, { mapToRelative } from '../src';

describe('Babel plugin module alias', () => {
    const transformerOpts = {
        plugins: [
            [plugin, [{
                src: './src/mylib/subfolder/utils',
                expose: 'utils'
            }, {
                src: './src/components',
                expose: 'awesome/components'
            }]]
        ]
    };

    describe('should alias a known path', () => {
        describe('using a simple exposed name', () => {
            describe('when requiring the exact name', () => {
                it('with a require statement', () => {
                    const code = 'var utils = require("utils");';
                    const result = transform(code, transformerOpts);

                    assert.strictEqual(result.code, 'var utils = require("./src/mylib/subfolder/utils");');
                });

                it('with an import statement', () => {
                    const code = 'import utils from "utils";';
                    const result = transform(code, transformerOpts);

                    assert.strictEqual(result.code, 'import utils from "./src/mylib/subfolder/utils";');
                });
            });

            describe('when requiring a sub file of the exposed name', () => {
                it('with a require statement', () => {
                    const code = 'var myUtil = require("utils/my-util-file");';
                    const result = transform(code, transformerOpts);

                    assert.strictEqual(result.code, 'var myUtil = require("./src/mylib/subfolder/utils/my-util-file");');
                });

                it('with an import statement', () => {
                    const code = 'import myUtil from "utils/my-util-file";';
                    const result = transform(code, transformerOpts);

                    assert.strictEqual(result.code, 'import myUtil from "./src/mylib/subfolder/utils/my-util-file";');
                });
            });
        });

        describe('using a "complex" exposed name', () => {
            describe('when requiring the exact name', () => {
                it('with a require statement', () => {
                    const code = 'var comps = require("awesome/components");';
                    const result = transform(code, transformerOpts);

                    assert.strictEqual(result.code, 'var comps = require("./src/components");');
                });

                it('with an import statement', () => {
                    const code = 'import comps from "awesome/components";';
                    const result = transform(code, transformerOpts);

                    assert.strictEqual(result.code, 'import comps from "./src/components";');
                });
            });

            describe('when requiring a sub file of the exposed name', () => {
                it('with a require statement', () => {
                    const code = 'var myComp = require("awesome/components/my-comp");';
                    const result = transform(code, transformerOpts);

                    assert.strictEqual(result.code, 'var myComp = require("./src/components/my-comp");');
                });

                it('with an import statement', () => {
                    const code = 'import myComp from "awesome/components/my-comp";';
                    const result = transform(code, transformerOpts);

                    assert.strictEqual(result.code, 'import myComp from "./src/components/my-comp";');
                });
            });
        });
    });

    describe('should not alias a unknown path', () => {
        it('with a require statement', () => {
            const code = 'var otherLib = require("other-lib");';
            const result = transform(code, transformerOpts);

            assert.strictEqual(result.code, 'var otherLib = require("other-lib");');
        });

        it('with an import statement', () => {
            const code = 'import otherLib from "other-lib";';
            const result = transform(code, transformerOpts);

            assert.strictEqual(result.code, 'import otherLib from "other-lib";');
        });
    });

    describe('should map to relative path when cwd has been changed', () => {
        const cwd = process.cwd();

        before(() => {
            process.chdir('./test');
        });

        after(() => {
            process.chdir(cwd);
        });

        it('with relative filename', () => {
            const currentFile = './utils/test/file.js';
            const result = mapToRelative(currentFile, 'utils/dep');

            assert.strictEqual(result, '../dep');
        });

        it('with absolute filename', () => {
            const currentFile = path.join(process.cwd(), './utils/test/file.js');
            const result = mapToRelative(currentFile, 'utils/dep');

            assert.strictEqual(result, '../dep');
        });
    });
});
