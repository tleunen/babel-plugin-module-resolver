import { matchesPattern, isImportCall } from '../utils';
import mapPathString from '../mapPath';

export default function transformCall(nodePath, state) {
  if (state.moduleResolverVisited.has(nodePath)) {
    return;
  }

  const calleePath = nodePath.get('callee');
  const transformFunction = state.normalizedOpts.transformFunctions.find(({ pattern }) =>
    matchesPattern(state.types, calleePath, pattern)
  );

  if (transformFunction) {
    state.moduleResolverVisited.add(nodePath);
    const { isModulePath } = transformFunction;
    mapPathString(nodePath.get('arguments.0'), state, { isModulePath });
  } else if (isImportCall(state.types, nodePath)) {
    state.moduleResolverVisited.add(nodePath);
    mapPathString(nodePath.get('arguments.0'), state, { isModulePath: true });
  }
}
