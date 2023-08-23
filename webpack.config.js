'use strict';

require('dotenv').config();
const path = require('path');
const webpack = require('webpack');
const moment = require('moment');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const {
  presetEditor,
  webpackCleanIgnorePatterns,
} = require('./scripts/preset-editor');
const srcPath = path.resolve(__dirname, 'src');
const distPath = path.resolve(__dirname, 'dist');
const pagesPath = path.resolve(srcPath, 'pages');
const templatePath = path.join(srcPath, 'template.html');
const pkg = require('./package.json');

const {
  SERVER_HOST,
  NODE_ENV,
} = process.env;

const isProd = NODE_ENV === 'production';

const fileExtensions = [
  'jpg', 'jpeg', 'png', 'gif',
  'eot', 'otf', 'ttf', 'woff', 'woff2',
];

const entries = {
  contentScript: 'content-scripts',
  background: 'background',
  extensionPage: [ 'sandbox', 'setting' ],
};

const htmlPlugins = entries.extensionPage.map(item => new HtmlWebpackPlugin({
  template: templatePath,
  filename: `${item}.html`,
  chunks: [ item ],
  minify: false,
}));

const plugins = [
  new webpack.ProgressPlugin(),
  ...htmlPlugins,
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.join(srcPath, 'manifest.json'),
        transform(content) {
          const origin = JSON.parse(content.toString());
          const value = JSON.stringify(Object.assign({
            version: pkg.version,
            name: pkg.description,
          }, origin), null, 2);
          return Buffer.from(value);
        },
      },
      {
        from: path.join(pagesPath, 'background/background-wrapper.js'),
        to: path.join(distPath, pkg.version, 'background-wrapper.js'),
      },
    ],
  }),
  new webpack.DefinePlugin({
    'process.env.VERSION': JSON.stringify(pkg.version),
    'process.env.BUILD_TIME': JSON.stringify(moment().format('MMDDHHmm')),
    'process.env.SERVER_HOST': JSON.stringify(SERVER_HOST),
  }),
];

if (isProd) {
  plugins.unshift(new CleanWebpackPlugin({
    verbose: true,
    cleanOnceBeforeBuildPatterns: [
      '**/*',
      ...webpackCleanIgnorePatterns,
    ],
  }));
}

const entry = {
  [entries.background]: path.join(pagesPath, entries.background),
  [entries.contentScript]: path.join(pagesPath, 'inject', entries.contentScript),
};

entries.extensionPage.forEach(item => {
  entry[item] = path.join(pagesPath, item);
});

const rules = [
  {
    test: /\.tsx?$/,
    use: [
      {
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
    exclude: /node_modules/,
  },
  {
    test: /\.less$/,
    exclude(filePath) {
      return filePath.endsWith('.module.less');
    },
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
      },
      {
        loader: 'less-loader',
      },
    ],
  },
  {
    test: /\.module\.less$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
        options: {
          modules: {
            auto: true,
            localIdentName: '[name]_[local]_[hash:base64:5]',
          },
        },
      },
      {
        loader: 'less-loader',
      },
    ],
  },
  {
    test: /.css$/,
    use: [
      {
        loader: 'style-loader',
      },
      {
        loader: 'css-loader',
      },
    ],
  },
  {
    test: new RegExp('images/.+\.(' + fileExtensions.join('|') + ')$'),
    type: 'asset/inline',
  },
  {
    test: new RegExp('icons/.+\.(' + fileExtensions.join('|') + ')$'),
    type: 'asset/resource',
    generator: {
      filename: '[name][ext]',
    },
  },
  {
    test: /\.svg$/i,
    issuer: /\.tsx?$/,
    resourceQuery: { not: [ /url/ ] }, // exclude react component if *.svg?url
    use: [ '@svgr/webpack' ],
  },
  {
    test: /\.svg$/i,
    resourceQuery: /url/, // *.svg?url
    type: 'asset',
  },
];

/**
 * @type import('webpack').Configuration
 */
const options = {
  stats: 'errors-only',
  entry,
  output: {
    path: path.join(__dirname, 'dist', pkg.version),
    filename: '[name].js',
  },
  module: {
    rules,
  },
  resolve: {
    alias: {
      '@': srcPath,
    },
    modules: [
      'node_modules',
    ],
    extensions: [
      '*',
      '.js', '.jsx', '.json',
      '.ts', '.tsx',
      '.less', '.css',
    ].concat(fileExtensions.map(item => `.${item}`)),
  },
  plugins,
  devtool: false,
  watch: !isProd,
  watchOptions: {
    ignored: '**/node_modules',
  },
  devServer: {
    devMiddleware: {
      writeToDisk: true,
    },
    client: {
      overlay: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  optimization: {
    minimize: isProd,
    nodeEnv: NODE_ENV,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};


module.exports = async () => {
  await presetEditor();

  return options;
};
