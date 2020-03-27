module.exports = {
  extends: 'erb',
  rules: {
    /** done solely for checkboxRef in Episode.js **/
    'no-return-assign': 'off'
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: require.resolve('./configs/webpack.config.eslint.js')
      }
    }
  }
};
