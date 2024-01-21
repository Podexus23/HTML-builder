const fsPromise = require('fs/promises');
const path = require('path');

const stylesPath = path.join(__dirname, 'styles');
const projectPath = path.join(__dirname, 'project-dist');

const addToBundle = async (cssFilePath) => {
  const bundlePath = path.join(projectPath, 'bundle.css');
  try {
    await fsPromise.access(bundlePath);
    await fsPromise.rm(bundlePath);
  } catch (err) {
    return err;
  } finally {
    const readStyle = await fsPromise.readFile(cssFilePath, 'utf-8');
    await fsPromise.writeFile(bundlePath, readStyle, {
      encoding: 'utf-8',
      flag: 'a',
    });
  }
};

const checkCssFiles = async (dirPath) => {
  let data = await fsPromise.readdir(dirPath, { withFileTypes: true });
  data.forEach(async (elem) => {
    const ext = path.extname(elem.name);
    const filePath = path.join(dirPath, elem.name);

    if (elem.isFile() && ext === '.css') {
      try {
        await fsPromise.access(filePath);
        await addToBundle(filePath);
      } catch (err) {
        return err;
      }
    }
  });
};

(async () => {
  await checkCssFiles(stylesPath);
})();
