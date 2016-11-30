/* eslint-env jest */
import { transform } from 'babel-core'; // eslint-disable-line import/no-extraneous-dependencies
import plugin from '../src';

describe('System.import', () => {
    const transformerOpts = {
        babelrc: false,
        plugins: [
            [plugin, {
                root: [
                    './test/examples/components',
                    './test/examples/foo',
                ],
                alias: {
                    utils: './src/mylib/subfolder/utils',
                },
            }],
        ],
    };

    it('should resolve the path based on the root config', () => {
        const code = 'System.import("c1").then(() => {}).catch(() => {});';
        const result = transform(code, transformerOpts);

        expect(result.code).toBe('System.import("./test/examples/components/c1").then(() => {}).catch(() => {});');
    });

    it('should alias the path', () => {
        const code = 'System.import("utils").then(() => {}).catch(() => {});';
        const result = transform(code, transformerOpts);

        expect(result.code).toBe('System.import("./src/mylib/subfolder/utils").then(() => {}).catch(() => {});');
    });

    it('should not change the path', () => {
        const code = 'System.import("./utils").then(() => {}).catch(() => {});';
        const result = transform(code, transformerOpts);

        expect(result.code).toBe('System.import("./utils").then(() => {}).catch(() => {});');
    });
});
