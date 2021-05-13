module.exports = {
  extends: 'erb',
  rules: {
    /** done solely for checkboxRef in Episode.js * */
    'no-return-assign': 'off',
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    // note you must disable the base rule as it can report incorrect errors
    'eslint/no-use-before-define': 'off',
    'no-use-before-define': 'off',
    // '@typescript-eslint/no-use-before-define': ['error'],
    '@typescript-eslint/no-use-before-define': ['warn'],

    // Since we do not use prop-types
    'react/prop-types': 'off',
    'react/static-property-placement': 'off',
    'react/require-default-props': 'off',
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.js'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
