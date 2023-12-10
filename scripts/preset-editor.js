'use strict';

const path = require('path');
const chalk = require('chalk');
const urllib = require('urllib');
const {
  promises: fs,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  createWriteStream,
} = require('fs');

const { distFolder, sleep } = require('./common');

const LAKE_EDITOR_VERSION = '1.11.0';

const lakeIconURL = 'https://mdn.alipayobjects.com/design_kitchencore/afts/file/HWy0Q7LuuV0AAAAAAAAAAAAADhulAQBr';

const remoteAssetsUrls = {
  lakejs: {
    src: `https://gw.alipayobjects.com/render/p/yuyan_npm/@alipay_lakex-doc/${LAKE_EDITOR_VERSION}/umd/doc.umd.js`,
    after: (content) => {
      return content.replace(lakeIconURL, './lake-editor-icon.js');
    },
  },
  lakecss: `https://gw.alipayobjects.com/render/p/yuyan_npm/@alipay_lakex-doc/${LAKE_EDITOR_VERSION}/umd/doc.css`,
  antdcss: {
    src: 'https://gw.alipayobjects.com/os/lib/antd/4.24.13/dist/antd.css',
    name: 'antd.4.24.13.css',
  },
  lakeIcon: {
    src: lakeIconURL,
    name: 'lake-editor-icon.js',
  },
  codemirror: 'https://gw.alipayobjects.com/render/p/yuyan_v/180020010000005484/7.1.4/CodeMirror.js',
  tracert_a385: 'https://ur.alipay.com/tracert_a385.js',
};

const localAssetsPaths = {
  katex: require.resolve('katex/dist/katex.min.js'),
  react: require.resolve('react').replace('/index.js', '/umd/react.production.min.js'),
  reactDOM: require.resolve('react-dom').replace('/index.js', '/umd/react-dom.production.min.js'),
};

async function downloadFile(remoteURL, localFilename, afterLoad) {
  console.log(`# downaload file to ${chalk.cyan(localFilename)} from ${remoteURL}`);
  const fd = await fs.open(localFilename, 'w', 0o644);
  await sleep(100);
  await urllib.request(remoteURL, {
    timeout: 10 * 1000,
    writeStream: createWriteStream(localFilename, {
      fd,
    }),
  });
  if(afterLoad) {
    const data = readFileSync(localFilename, 'utf-8');
    const newData = afterLoad(data);
    writeFileSync(localFilename, newData);
  }
}

module.exports.webpackCleanIgnorePatterns = Object.values({
  ...remoteAssetsUrls,
  ...localAssetsPaths,
})
  .map(url => (typeof url === 'string' ? url : url.src).split('/').pop())
  .map(fileName => `!${fileName}`);

module.exports.presetEditor = async function main() {
  console.log('start preset editor ...');

  const urls = Object.values(remoteAssetsUrls);
  for (let i = 0; i < urls.length; i++) {
    const asset = urls[i];
    const url = typeof asset === 'string' ? asset : asset.src;
    const afterLoad = typeof asset === 'string' ? null : asset.after;
    const fileName = asset.name || url.split('/').pop();
    const localFilename = path.resolve(distFolder, fileName);
    mkdirSync(distFolder, { recursive: true });
    await downloadFile(url, localFilename, afterLoad);
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

  console.log('\n✅ preset editor success ...\n');
};
