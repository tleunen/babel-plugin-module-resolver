import { mapPathString } from '../utils';


export default function transformImport(nodePath, state) {
  mapPathString(nodePath.get('source'), state);
}
