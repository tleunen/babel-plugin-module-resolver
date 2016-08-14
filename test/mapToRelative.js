/* eslint-env mocha */
import path from 'path';
import assert from 'assert';
import mapToRelative from '../src/mapToRelative';

describe('mapToRelative', () => {
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
