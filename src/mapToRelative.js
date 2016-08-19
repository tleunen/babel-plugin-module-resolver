import path from 'path';

function resolve(filename) {
    if (path.isAbsolute(filename)) return filename;
    return path.resolve(process.cwd(), filename);
}

function toPosixPath(modulePath) {
    return modulePath.replace(/\\/g, '/');
}

export default function mapToRelative(currentFile, module) {
    let from = path.dirname(currentFile);
    let to = path.normalize(module);

    from = resolve(from);
    to = resolve(to);

    let moduleMapped = path.relative(from, to);

    moduleMapped = toPosixPath(moduleMapped);

    if (moduleMapped[0] !== '.') moduleMapped = `./${moduleMapped}`;

    return moduleMapped;
}
