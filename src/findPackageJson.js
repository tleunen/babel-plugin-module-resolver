import fs from 'fs';
import path from 'path';

export default function findPackageJson(startPath) {
  const resolvedStartPath = path.resolve(startPath);
  let currentDir = path.extname(resolvedStartPath)
    ? path.dirname(resolvedStartPath)
    : resolvedStartPath;

  while (currentDir) {
    const packageJsonPath = path.join(currentDir, 'package.json');

    if (fs.existsSync(packageJsonPath)) {
      return packageJsonPath;
    }

    const parentDir = path.dirname(currentDir);

    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }

  return null;
}
