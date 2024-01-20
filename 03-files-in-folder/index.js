const fsPromises = require('fs/promises');
const fs = require('fs');
const path = require('path');

const folder = path.join(__dirname, 'secret-folder');

async function getFolderData() {
  return await fsPromises.readdir(folder, { withFileTypes: true });
}
(async () => {
  let data = await getFolderData();
  data.forEach((elem) => {
    if (elem.isFile()) {
      const filePath = path.join(folder, elem.name);

      fs.access(filePath, () => {
        if (filePath) {
          fs.stat(filePath, (err, stats) => {
            const { ext, name } = path.parse(filePath);
            const fileSize =
              stats.size > 1000 ? `${stats.size / 1000}kb` : `${stats.size}b`;
            console.log(`${name} - ${ext.slice(1)} - ${fileSize}`);
          });
        }
      });
    }
  });
})();
