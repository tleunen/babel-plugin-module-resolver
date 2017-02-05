/* eslint-env jest */
import { transform } from 'babel-core'; // eslint-disable-line import/no-extraneous-dependencies
import plugin from '../src';

describe('jest functions', () => {
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

    ['mock', 'doMock'].forEach((name) => {
        describe(`jest.${name}`, () => {
            it('should resolve the path based on the root config', () => {
                const code = `jest.${name}("components/Header/SubHeader", () => {});`;
                const result = transform(code, transformerOpts);

                expect(result.code).toBe(`jest.${name}("./test/testproject/src/components/Header/SubHeader", () => {});`);
            });

            it('should alias the path', () => {
                const code = `jest.${name}("test", () => {});`;
                const result = transform(code, transformerOpts);

                expect(result.code).toBe(`jest.${name}("./test/testproject/test", () => {});`);
            });

            it('should not change the path', () => {
                const code = `jest.${name}("./utils", () => {});`;
                const result = transform(code, transformerOpts);

                expect(result.code).toBe(`jest.${name}("./utils", () => {});`);
            });
        });
    });

    ['unmock', 'dontMock', 'genMockFromModule'].forEach((name) => {
        describe(`jest.${name}`, () => {
            it('should resolve the path based on the root config', () => {
                const code = `jest.${name}("components/Sidebar/Footer");`;
                const result = transform(code, transformerOpts);

                expect(result.code).toBe(`jest.${name}("./test/testproject/src/components/Sidebar/Footer");`);
            });

            it('should alias the path', () => {
                const code = `jest.${name}("test");`;
                const result = transform(code, transformerOpts);

                expect(result.code).toBe(`jest.${name}("./test/testproject/test");`);
            });

            it('should not change the path', () => {
                const code = `jest.${name}("./utils");`;
                const result = transform(code, transformerOpts);

                expect(result.code).toBe(`jest.${name}("./utils");`);
            });
        });
    });
});
