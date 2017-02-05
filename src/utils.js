import path from 'path';

export function toPosixPath(modulePath) {
    return modulePath.replace(/\\/g, '/');
}

export function toLocalPath(p) {
    return p
        .replace(/\/index$/, '') // remove trailing /index
        .replace(/^(?!\.)/, './'); // insert `./` to make it a local path
}

export function replaceExtension(p, ext) {
    const filename = path.basename(p, path.extname(p)) + ext;
    return path.join(path.dirname(p), filename);
}
