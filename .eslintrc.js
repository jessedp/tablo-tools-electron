module.exports = {
  extends: 'erb',
  env: { es2021: true },
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    // 'import/no-extraneous-dependencies': ['error', { devDependencies: true }],

    // Since React 17 and typescript 4.1 you can safely disable the rule
    'react/react-in-jsx-scope': 'off',
    'jsx-a11y/label-has-associated-control': [
      'warn',
      {
        labelComponents: ['label'],
        labelAttributes: ['label'],
        controlComponents: ['FullCheckbox'],
        depth: 3,
      },
    ],
    'dot-notation': 'off',
    '@typescript-eslint/dot-notation': 'off',
    // TODO: needs to be turned on again
    '@typescript-eslint/no-explicit-any': 'off',
    'react/static-property-placement': 'off',
    'import/no-cycle': 'warn',
    'no-console': 'off',
    // added after package upgrades in 0.3.12
    'import/extensions': [
      'error',
      {
        json: 'always',
      },
    ],
    'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
    // no dumb, useless rules
    'react/jsx-no-useless-fragment': 'off',
    // turn off b/c typescript does this for us(?)
    'no-undef': 'off',
    'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
    'class-methods-use-this': 'off',
    'import/no-import-module-exports': [
      'error',
      {
        exceptions: ['**/*/webpack.config.*.ts'],
      },
    ],
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
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
      typescript: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
