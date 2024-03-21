const fs = require('fs');
const path = require('path');

function walkDirSync(currentDirPath, callback) {
  if (!fs.existsSync(currentDirPath)) {
    return;
  }

  fs.readdirSync(currentDirPath)
    .forEach(name => {
      const filePath = path.join(currentDirPath, name);
      const stat = fs.statSync(filePath);

      if (stat.isFile()) {
        callback(filePath, name, stat);
      } else if (stat.isDirectory()) {
        walkDirSync(filePath, callback);
      }
    });
}

module.exports = {
  walkDirSync,
};
