'use strict';

/* eslint-env node */
const eslintConfig = {
  extends: 'eslint-config-egg',
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', `${__dirname}/src`],
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    },
  },
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      experimentalObjectRestSpread: true,
    },
  },
  plugins: [
    'import',
    'react',
    'react-hooks',
  ],
  ignorePatterns: ['*.d.ts'],
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        tsx: 'never',
        js: 'never',
        jsx: 'never',
      },
    ],
    'array-bracket-spacing': [
      'error',
      'never',
    ],
  },
  overrides: [],
};

const tslintConfig = {
  // enable the rule specifically for TypeScript files
  files: ['*.ts', '*.tsx'],
  extends: [
    'eslint-config-egg/typescript',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      ...eslintConfig.settings['import/resolver'],
      typescript: {
        project: [
          'tsconfig.json',
        ],
      },
    },
  },
  rules: {
    ...eslintConfig.rules,
    'no-unused-vars': 0,
    'no-undef': 'off',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    strict: 'off',
    '@typescript-eslint/ban-ts-comment': ['warn'],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'no-multiple-empty-lines': [
      'error',
      {
        max: 1,
        maxEOF: 0,
        maxBOF: 0,
      },
    ],
    'no-bitwise': 'off',
  },
};

eslintConfig.overrides.push(tslintConfig);

module.exports = eslintConfig;
