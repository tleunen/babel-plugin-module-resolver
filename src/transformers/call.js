import {
  matchesPattern,
  mapPathString,
  isImportCall,
} from '../utils';


export default function transformCall(nodePath, state) {
  const calleePath = nodePath.get('callee');
  const isNormalCall = state.opts.transformFunctions.some(
    pattern => matchesPattern(state.types, calleePath, pattern),
  );

  if (isNormalCall || isImportCall(state.types, nodePath)) {
    mapPathString(nodePath.get('arguments.0'), state);
  }
}
