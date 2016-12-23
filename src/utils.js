import path from 'path';

export function toPosixPath(modulePath) {
    return modulePath.replace(/\\/g, '/');
}

export function toLocalPath(p) {
    return (p[0] !== '.')
        ? `./${p}`
        : p;
}

export function replaceExtension(p, ext) {
    const filename = path.basename(p, path.extname(p)) + ext;
    return path.join(path.dirname(p), filename);
}
