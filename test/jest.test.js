/* eslint-env jest */
import { transform } from 'babel-core'; // eslint-disable-line import/no-extraneous-dependencies
import plugin from '../src';

describe('jest functions', () => {
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

    describe('jest.mock', () => {
        it('should resolve the path based on the root config', () => {
            const code = 'jest.mock("c1", () => {});';
            const result = transform(code, transformerOpts);

            expect(result.code).toBe('jest.mock("./test/examples/components/c1", () => {});');
        });

        it('should alias the path', () => {
            const code = 'jest.mock("utils", () => {});';
            const result = transform(code, transformerOpts);

            expect(result.code).toBe('jest.mock("./src/mylib/subfolder/utils", () => {});');
        });

        it('should not change the path', () => {
            const code = 'jest.mock("./utils", () => {});';
            const result = transform(code, transformerOpts);

            expect(result.code).toBe('jest.mock("./utils", () => {});');
        });
    });

    describe('jest.unmock', () => {
        it('should resolve the path based on the root config', () => {
            const code = 'jest.unmock("c1");';
            const result = transform(code, transformerOpts);

            expect(result.code).toBe('jest.unmock("./test/examples/components/c1");');
        });

        it('should alias the path', () => {
            const code = 'jest.unmock("utils");';
            const result = transform(code, transformerOpts);

            expect(result.code).toBe('jest.unmock("./src/mylib/subfolder/utils");');
        });

        it('should not change the path', () => {
            const code = 'jest.unmock("./utils");';
            const result = transform(code, transformerOpts);

            expect(result.code).toBe('jest.unmock("./utils");');
        });
    });

    describe('jest.genMockFromModule', () => {
        it('should resolve the path based on the root config', () => {
            const code = 'jest.genMockFromModule("c1");';
            const result = transform(code, transformerOpts);

            expect(result.code).toBe('jest.genMockFromModule("./test/examples/components/c1");');
        });

        it('should alias the path', () => {
            const code = 'jest.genMockFromModule("utils");';
            const result = transform(code, transformerOpts);

            expect(result.code).toBe('jest.genMockFromModule("./src/mylib/subfolder/utils");');
        });

        it('should not change the path', () => {
            const code = 'jest.genMockFromModule("./utils");';
            const result = transform(code, transformerOpts);

            expect(result.code).toBe('jest.genMockFromModule("./utils");');
        });
    });
});
