import {
  matchesPattern,
  mapPathString,
  isImportCall,
} from '../utils';


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

export default function transformCall(nodePath, state) {
  const calleePath = nodePath.get('callee');
  const isNormalCall = patterns.some(pattern => matchesPattern(state.types, calleePath, pattern));

  if (isNormalCall || isImportCall(state.types, nodePath)) {
    mapPathString(nodePath.get('arguments.0'), state);
  }
}
