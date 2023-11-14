'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { projectPath } = require('../config/common');
const { walkDirSync } = require('./tools-common');

const svgAssetPath = path.resolve(
  projectPath,
  'src',
  'assets',
  'svg'
);

function nameWithoutExt(name) {
  return name.split('.')
    .slice(0, -1)
    .join('.');
}

function updateAssetsMap({
  targetFilePath,
}) {
  const svgMap = {};

  walkDirSync(svgAssetPath, (filePath, name) => {
    const key = nameWithoutExt(name);
    if (!key) return;
    svgMap[key] = `import('@/assets/svg/${name}')`;
  });

  const generateArray = map => {
    let result = '';
    Object.keys(map).forEach(item => {
      result += `\t'${item}': ${map[item]},\n`;
    });
    return `{\n${result}}`;
  };


  // 写入文件
  fs.writeFileSync(
    targetFilePath,
    `/* eslint-disable quote-props */
/* eslint-disable @typescript-eslint/indent */
// 本文件为自动生成，不要手动修改
// npm run update:assets

export const SvgMaps = ${generateArray(svgMap)};

`
  );

  console.log(chalk.cyan(`成功生成资源映射文件 (共${Object.keys(svgMap).length} 项): ${targetFilePath}\n`));
}


updateAssetsMap({
  targetFilePath: path.resolve(projectPath, 'src/components/LarkIcon/SvgMap.ts'),
});

