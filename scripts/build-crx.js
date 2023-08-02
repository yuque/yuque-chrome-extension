'use strict';

const fs = require('fs');
const path = require('path');
const CRX = require('crx');
const pkg = require('../package.json');
const { distFolder, cdnPrefix } = require('./common');

async function buildCrxFromZip() {
  if (!process.env.CHROME_KEY_PEM) {
    console.warn('No CHROME_KEY_PEM found, skip building crx.');
    return;
  }

  const crx = new CRX({
    privateKey: decodeURIComponent(process.env.CHROME_KEY_PEM),
    // use this field in update.xml
    codebase: `${cdnPrefix}/${pkg.version}.crx`,
  });

  // 将 update_url 写入 manifest.json 中
  // chrome 商店版本不能写入 update_url
  // 仅作为离线版本分发
  const manifestJSON = require(path.resolve(distFolder, 'manifest.json'));
  manifestJSON.update_url = `${cdnPrefix}/updates.xml`;
  fs.writeFileSync(
    path.resolve(distFolder, 'manifest.json'),
    JSON.stringify(manifestJSON, null, 2),
    'utf-8'
  );

  return crx.load(distFolder)
    .then(crx => crx.pack())
    .then(crxBuffer => {
      fs.writeFileSync(path.resolve(__dirname, '..', pkg.version + '.crx'), crxBuffer);
      const xmlBuffer = crx.generateUpdateXML();
      fs.writeFileSync(path.resolve(__dirname, '../updates.xml'), xmlBuffer);
    });
}

buildCrxFromZip();
