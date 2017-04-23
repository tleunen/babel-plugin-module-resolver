/* eslint-env jest */
import { transform } from 'babel-core'; // eslint-disable-line import/no-extraneous-dependencies
import plugin from '../src';

// According to https://github.com/tc39/proposal-dynamic-import

describe('import()', () => {
  const transformerOpts = {
    babelrc: false,
    plugins: [
      // We need to add the corresponding syntax plugin
      // in order to parse the `import()`-calls
      'syntax-dynamic-import',
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
    const code = 'import("app").then(() => {}).catch(() => {});';
    const result = transform(code, transformerOpts);

    expect(result.code).toBe('import("./test/testproject/src/app").then(() => {}).catch(() => {});');
  });

  it('should alias the path', () => {
    const code = 'import("test/tools").then(() => {}).catch(() => {});';
    const result = transform(code, transformerOpts);

    expect(result.code).toBe('import("./test/testproject/test/tools").then(() => {}).catch(() => {});');
  });

  it('should not change the path', () => {
    const code = 'import("./something").then(() => {}).catch(() => {});';
    const result = transform(code, transformerOpts);

    expect(result.code).toBe('import("./something").then(() => {}).catch(() => {});');
  });

  it('should handle the first argument not being a string literal', () => {
    const code = 'import(path).then(() => {}).catch(() => {});';
    const result = transform(code, transformerOpts);

    expect(result.code).toBe('import(path).then(() => {}).catch(() => {});');
  });

  it('should handle an empty path', () => {
    const code = 'import("").then(() => {}).catch(() => {});';
    const result = transform(code, transformerOpts);

    expect(result.code).toBe('import("").then(() => {}).catch(() => {});');
  });
});
