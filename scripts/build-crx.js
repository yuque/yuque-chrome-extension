'use strict';

const fs = require('fs');
const path = require('path');
const CRX = require('crx');

const pkg = require('../package.json');

async function buildCrxFromZip() {
  const crx = new CRX({
    privateKey: fs.readFileSync(path.resolve(__dirname, '../key.pem')),
    // use this field in update.xml
    codebase: `https://app.nlark.com/yuque-chrome-extension/${pkg.version}.crx`,
  });

  return crx.load(path.resolve(__dirname, '../dist', pkg.version))
    .then(crx => crx.pack())
    .then(crxBuffer => {
      fs.writeFileSync(path.resolve(__dirname, '..', pkg.version + '.crx'), crxBuffer);
      const xmlBuffer = crx.generateUpdateXML();
      fs.writeFileSync(path.resolve(__dirname, '../updates.xml'), xmlBuffer);
    });
}

buildCrxFromZip();
