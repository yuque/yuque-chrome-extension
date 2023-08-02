'use strict';

const fs = require('fs');
const path = require('path');
const CRX = require('crx');

const pkg = require('../package.json');

const distFolder = path.resolve(__dirname, '../dist', pkg.version);

async function buildCrxFromZip() {
  const crx = new CRX({
    privateKey: process.env.CHROME_KEY_PEM || fs.readFileSync(path.resolve(__dirname, '../key.pem')),
    // use this field in update.xml
    codebase: `https://app.nlark.com/yuque-chrome-extension/${pkg.version}.crx`,
  });

  // 将 update_url 写入 manifest.json 中
  // chrome 商店版本不能写入 update_url
  // 仅作为离线版本分发
  const manifestJSON = require(path.resolve(distFolder, 'manifest.json'));
  manifestJSON.update_url = 'https://app.nlark.com/yuque-chrome-extension/updates.xml';
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
