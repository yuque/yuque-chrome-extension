'use strict';

const path = require('path');
const pkg = require('../package.json');

const distFolder = path.resolve(__dirname, '..', 'dist', process.env.BETA === 'beta' ? `${pkg.version}-beta` : pkg.version);
const cdnPrefix = 'https://app.nlark.com/yuque-chrome-extension';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

exports.cdnPrefix = cdnPrefix;
exports.distFolder = distFolder;
exports.sleep = sleep;
