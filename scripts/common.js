'use strict';

const path = require('path');
const pkg = require('../package.json');

const distFolder = path.resolve(__dirname, '..', 'dist', pkg.version);
const cdnPrefix = 'https://app.nlark.com/yuque-chrome-extension';

exports.cdnPrefix = cdnPrefix;
exports.distFolder = distFolder;
