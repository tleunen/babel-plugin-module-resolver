/* eslint-env jest */
import path from 'path';
import mapToRelative from '../src/mapToRelative';

describe('mapToRelative', () => {
    describe('should map to relative path with a custom cwd', () => {
        it('with relative filename', () => {
            const currentFile = './utils/test/file.js';
            const result = mapToRelative(path.resolve('./test'), currentFile, 'utils/dep');

            expect(result).toBe('../dep');
        });

        it('with absolute filename', () => {
            const currentFile = path.join(process.cwd(), './utils/test/file.js');
            const result = mapToRelative(process.cwd(), currentFile, 'utils/dep');

            expect(result).toBe('../dep');
        });
    });
});
