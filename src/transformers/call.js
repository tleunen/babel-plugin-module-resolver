import { matchesPattern, mapPathString } from '../utils';


const patterns = [
  'require',
  'require.resolve',
  'System.import',
  'jest.genMockFromModule',
  'jest.mock',
  'jest.unmock',
  'jest.doMock',
  'jest.dontMock',
];

export default function transformCall(types, nodePath, state) {
  const calleePath = nodePath.get('callee');

  if (!patterns.some(pattern => matchesPattern(types, calleePath, pattern))) {
    return;
  }

  mapPathString(types, nodePath.get('arguments.0'), state);
}
