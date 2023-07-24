'use strict';

module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
  ],
  plugins: [
    ['import', [{ libraryName: 'antd', style: true, }]],
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-optional-chaining',
    [
      '@babel/plugin-proposal-decorators',
      { legacy: true },
    ],
    '@babel/plugin-proposal-class-properties'
  ],
};
