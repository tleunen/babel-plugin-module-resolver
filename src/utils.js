export function toPosixPath(modulePath) {
    return modulePath.replace(/\\/g, '/');
}

export function toLocalPath(p) {
    return (p[0] !== '.')
        ? `./${p}`
        : p;
}
