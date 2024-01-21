const fsPromises = require('fs/promises');
const path = require('path');

//styles

const addToBundle = async (cssFilePath, bundleDir) => {
  const bundlePath = path.join(bundleDir, 'style.css');
  try {
    await fsPromises.access(bundlePath);
    await fsPromises.rm(bundlePath);
  } catch (err) {
    return err;
  } finally {
    const readStyle = await fsPromises.readFile(cssFilePath, 'utf-8');
    await fsPromises.writeFile(bundlePath, readStyle, {
      encoding: 'utf-8',
      flag: 'a',
    });
  }
};

const checkCssFiles = async (dirPath, bundlePath) => {
  let data = await fsPromises.readdir(dirPath, { withFileTypes: true });
  data.forEach(async (elem) => {
    const ext = path.extname(elem.name);
    const filePath = path.join(dirPath, elem.name);

    if (elem.isFile() && ext === '.css') {
      try {
        await fsPromises.access(filePath);
        await addToBundle(filePath, bundlePath);
      } catch (err) {
        return err;
      }
    }
  });
};

async function removeAndCreateDir(distPath) {
  try {
    await fsPromises.access(distPath);
    await fsPromises.rm(distPath, { force: true, recursive: true });
  } catch (err) {
    return err;
  } finally {
    await fsPromises.mkdir(distPath, { recursive: true });
  }
}

async function copyDir(from, to) {
  const dirFiles = await fsPromises.readdir(from, { withFileTypes: true });

  dirFiles.forEach(async (elem) => {
    const filePath = path.join(from, elem.name);
    const destPath = path.join(to, elem.name);

    if (elem.isFile()) {
      try {
        await fsPromises.access(filePath);
        await fsPromises.copyFile(filePath, destPath);
      } catch (err) {
        return err;
      }
    } else if (elem.isDirectory) {
      try {
        await fsPromises.access(filePath);
        await fsPromises.mkdir(destPath, { recursive: true });
        await copyDir(filePath, destPath);
      } catch (err) {
        return err;
      }
    }
  });
}

async function getHTMLComponents(dirPath) {
  let data = await fsPromises.readdir(dirPath, { withFileTypes: true });
  data = data.map(async (elem) => {
    const ext = path.extname(elem.name);
    const filePath = path.join(dirPath, elem.name);

    if (elem.isFile() && ext === '.html') {
      try {
        await fsPromises.access(filePath);
        return filePath;
      } catch (err) {
        return err;
      }
    }
  });
  return (await Promise.all(data)).filter((e) => e);
}

async function replaceComponents(html, componentsPaths) {
  const componentReg = /{{[a-zA-Z]+}}/g;
  let templatesToChange = html.match(componentReg);
  if (!templatesToChange) return index;

  let index = html;
  templatesToChange = templatesToChange.map(async (template) => {
    const tempName = template.slice(2, -2);
    const pathToTemp = componentsPaths.find((e) => e.includes(tempName));

    const componentHTML = await fsPromises.readFile(pathToTemp, 'utf-8');
    index = index.replace(template, componentHTML);
  });
  await Promise.all(templatesToChange);
  return index;
}

(async () => {
  const projectPath = path.join(__dirname, 'project-dist');
  //prep project folder
  await removeAndCreateDir(projectPath);

  //html
  const templatePath = path.join(__dirname, 'template.html');
  const componentsPath = path.join(__dirname, 'components');
  const indexHTMLPath = path.join(projectPath, 'index.html');

  const components = await getHTMLComponents(componentsPath);
  const templateData = await fsPromises.readFile(templatePath, 'utf-8');
  const indexHtml = await replaceComponents(templateData, components);
  await fsPromises.writeFile(indexHTMLPath, indexHtml, {
    encoding: 'utf-8',
    flag: 'w',
  });

  // console.log(indexHtml);

  //css
  const stylesPath = path.join(__dirname, 'styles');

  await checkCssFiles(stylesPath, projectPath);

  //assets
  const assetsDirPath = path.join(projectPath, 'assets');
  const assetsSourcePath = path.join(__dirname, 'assets');

  await removeAndCreateDir(assetsDirPath);
  await copyDir(assetsSourcePath, assetsDirPath);
})();
