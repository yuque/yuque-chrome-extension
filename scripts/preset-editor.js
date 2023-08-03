'use strict';

const path = require('path');
const urllib = require('urllib');
const { promises: fs, mkdirSync, createWriteStream, createReadStream } = require('fs');

const { distFolder, sleep } = require('./common');

const LAKE_EDITOR_VERSION = '1.0.1-dev4';

const AssetsURL = {
  lakejs: `https://gw.alipayobjects.com/render/p/yuyan_npm/@alipay_lakex-doc/${LAKE_EDITOR_VERSION}/umd/doc.umd.js`,
  lakecss: `https://gw.alipayobjects.com/render/p/yuyan_npm/@alipay_lakex-doc/${LAKE_EDITOR_VERSION}/umd/doc.css`,
  codemirror: 'https://gw.alipayobjects.com/render/p/yuyan_v/180020010000005484/7.1.4/CodeMirror.js',
  katex: require.resolve('katex/dist/katex.min.js'),
};

async function downloadFile(remoteURL, localFilename) {
  console.log(`# downaload file to ${localFilename} from ${remoteURL}`);
  mkdirSync(path.dirname(localFilename), { recursive: true });
  await sleep(500);
  const fd = await fs.open(localFilename, 'w', 0o644);
  await sleep(500);
  await urllib.request(remoteURL, {
    timeout: 10 * 1000,
    writeStream: createWriteStream(localFilename, {
      fd,
    }),
  });
}

async function moveFile(src, dist) {
  console.log(`# move file to ${dist} from ${src}`);
  mkdirSync(path.dirname(dist), { recursive: true });
  return new Promise((resolve, reject) => {
    createReadStream(src)
      .pipe(createWriteStream(dist))
      .on('end', () => {
        resolve(true);
      })
      .on('error', reject);
  });
}

const urls = Object.values(AssetsURL);

module.exports.webpackCleanIgnorePatterns = urls
  .map(url => url.split('/').pop())
  .map(fileName => `!${fileName}`);

module.exports.presetEditor = async function main() {
  console.log('start preset editor ...');

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const fileName = url.split('/').pop();
    const localFilename = path.resolve(distFolder, fileName);
    if (!url.startsWith('http')) {
      moveFile(url, localFilename);
    } else {
      await downloadFile(url, localFilename);
    }
  }
};
