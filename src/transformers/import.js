import { mapPathString } from '../utils';


export default function transformImport(types, nodePath, state) {
  mapPathString(types, nodePath.get('source'), state);
}
