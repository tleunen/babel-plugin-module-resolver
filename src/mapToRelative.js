import path from 'path';
import { toPosixPath } from './utils';
import isAbsolutePath from 'path-is-absolute';

function resolve(filename) {
    if (isAbsolutePath(filename)) return filename;
    return path.resolve(process.cwd(), filename);
}

export default function mapToRelative(currentFile, module) {
    let from = path.dirname(currentFile);
    let to = path.normalize(module);

    from = resolve(from);
    to = resolve(to);

    const moduleMapped = path.relative(from, to);
    return toPosixPath(moduleMapped);
}
