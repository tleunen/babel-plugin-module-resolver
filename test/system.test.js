/* eslint-env jest */
import { transform } from 'babel-core'; // eslint-disable-line import/no-extraneous-dependencies
import plugin from '../src';

describe('System.import', () => {
    const transformerOpts = {
        babelrc: false,
        plugins: [
            [plugin, {
                root: [
                    './test/testproject/src',
                ],
                alias: {
                    test: './test/testproject/test',
                },
            }],
        ],
    };

    it('should resolve the path based on the root config', () => {
        const code = 'System.import("app").then(() => {}).catch(() => {});';
        const result = transform(code, transformerOpts);

        expect(result.code).toBe('System.import("./test/testproject/src/app").then(() => {}).catch(() => {});');
    });

    it('should alias the path', () => {
        const code = 'System.import("test/tools").then(() => {}).catch(() => {});';
        const result = transform(code, transformerOpts);

        expect(result.code).toBe('System.import("./test/testproject/test/tools").then(() => {}).catch(() => {});');
    });

    it('should not change the path', () => {
        const code = 'System.import("./something").then(() => {}).catch(() => {});';
        const result = transform(code, transformerOpts);

        expect(result.code).toBe('System.import("./something").then(() => {}).catch(() => {});');
    });
});
