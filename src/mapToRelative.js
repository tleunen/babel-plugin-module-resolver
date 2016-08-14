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

    // Support npm modules instead of directories
    if (moduleMapped.indexOf('npm:') !== -1) {
        const [, npmModuleName] = moduleMapped.split('npm:');
        return npmModuleName;
    }

    if (moduleMapped[0] !== '.') moduleMapped = `./${moduleMapped}`;

    return moduleMapped;
}
