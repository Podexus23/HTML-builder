const fsPromise = require('fs/promises');
const path = require('path');

const defDir = path.join(__dirname, 'files');
const destDir = path.join(__dirname, 'files-copy');

async function checkCopyDir() {
  try {
    await fsPromise.access(destDir);
    await fsPromise.rm(destDir, { force: true, recursive: true });
  } catch (err) {
    return err;
  } finally {
    await fsPromise.mkdir(destDir, { recursive: true });
  }
}

async function copyDir(from, to) {
  const dirFiles = await fsPromise.readdir(from, { withFileTypes: true });

  dirFiles.forEach(async (elem) => {
    const filePath = path.join(from, elem.name);
    const destPath = path.join(to, elem.name);

    if (elem.isFile()) {
      try {
        await fsPromise.access(filePath);
        await fsPromise.copyFile(filePath, destPath);
      } catch (err) {
        return err;
      }
    } else if (elem.isDirectory) {
      try {
        await fsPromise.access(filePath);
        await fsPromise.mkdir(destPath, { recursive: true });
        await copyDir(filePath, destPath);
      } catch (err) {
        return err;
      }
    }
  });
}

(async () => {
  await checkCopyDir();
  await copyDir(defDir, destDir);
})();
