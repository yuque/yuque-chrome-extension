'use strict';

const path = require('path');
const chalk = require('chalk');
const urllib = require('urllib');
const {
  promises: fs,
  mkdirSync,
  copyFileSync,
  createWriteStream,
} = require('fs');

const { distFolder, sleep } = require('./common');

const LAKE_EDITOR_VERSION = '1.0.1-dev4';

const remoteAssetsUrls = {
  lakejs: `https://gw.alipayobjects.com/render/p/yuyan_npm/@alipay_lakex-doc/${LAKE_EDITOR_VERSION}/umd/doc.umd.js`,
  lakecss: `https://gw.alipayobjects.com/render/p/yuyan_npm/@alipay_lakex-doc/${LAKE_EDITOR_VERSION}/umd/doc.css`,
  codemirror: 'https://gw.alipayobjects.com/render/p/yuyan_v/180020010000005484/7.1.4/CodeMirror.js',
  tracert_a385: 'https://ur.alipay.com/tracert_a385.js',
};

const localAssetsPaths = {
  katex: require.resolve('katex/dist/katex.min.js'),
};

async function downloadFile(remoteURL, localFilename) {
  console.log(`# downaload file to ${chalk.cyan(localFilename)} from ${remoteURL}`);
  const fd = await fs.open(localFilename, 'w', 0o644);
  await sleep(100);
  await urllib.request(remoteURL, {
    timeout: 10 * 1000,
    writeStream: createWriteStream(localFilename, {
      fd,
    }),
  });
}

module.exports.webpackCleanIgnorePatterns = Object.values({
  ...remoteAssetsUrls,
  ...localAssetsPaths,
})
  .map(url => url.split('/').pop())
  .map(fileName => `!${fileName}`);

module.exports.presetEditor = async function main() {
  console.log('start preset editor ...');

  const urls = Object.values(remoteAssetsUrls);
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const fileName = url.split('/').pop();
    const localFilename = path.resolve(distFolder, fileName);
    mkdirSync(distFolder, { recursive: true });
    await downloadFile(url, localFilename);
  }

  const localAssets = Object.values(localAssetsPaths);
  for (let i = 0; i < localAssets.length; i++) {
    const filePath = localAssets[i];
    const fileName = path.basename(filePath);
    const localFilename = path.resolve(distFolder, fileName);
    mkdirSync(distFolder, { recursive: true });
    console.log(`# copy file to ${chalk.cyan(localFilename)} from ${filePath}`);
    copyFileSync(filePath, localFilename);
  }
};
