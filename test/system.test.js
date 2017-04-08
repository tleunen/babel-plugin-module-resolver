import { transform } from 'babel-core';
import plugin from '../src';

describe('System.import', () => {
  const transformerOpts = {
    babelrc: false,
    plugins: [
      [plugin, {
        root: './test/testproject/src',
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

  it('should handle no arguments', () => {
    const code = 'System.import().then(() => {}).catch(() => {});';
    const result = transform(code, transformerOpts);

    expect(result.code).toBe('System.import().then(() => {}).catch(() => {});');
  });

  it('should handle the first argument not being a string literal', () => {
    const code = 'System.import(path).then(() => {}).catch(() => {});';
    const result = transform(code, transformerOpts);

    expect(result.code).toBe('System.import(path).then(() => {}).catch(() => {});');
  });

  it('should handle an empty path', () => {
    const code = 'System.import(\'\').then(() => {}).catch(() => {});';
    const result = transform(code, transformerOpts);

    expect(result.code).toBe('System.import(\'\').then(() => {}).catch(() => {});');
  });
});
