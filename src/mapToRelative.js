import path from 'path';

import { toPosixPath } from './utils';


function resolve(cwd, filename) {
  if (path.isAbsolute(filename)) {
    return filename;
  }

  return path.resolve(cwd, filename);
}

export default function mapToRelative(cwd, currentFile, module) {
  let from = path.dirname(currentFile);
  let to = path.normalize(module);

  from = resolve(cwd, from);
  to = resolve(cwd, to);

  const moduleMapped = path.relative(from, to);
  return toPosixPath(moduleMapped);
}
