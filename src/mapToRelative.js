import path from 'path';
import { toPosixPath } from './utils';

function resolve(filename) {
    if (path.isAbsolute(filename)) return filename;
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
