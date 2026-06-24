const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  eslintConfigPrettier,
  {
    ignores: [
      'node_modules',
      'ios',
      'android',
      '.expo',
      'dist',
      'web-build',
      'calendar-planner_expo_2018',
      'jest.setup.js',
    ],
  },
  {
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
];
