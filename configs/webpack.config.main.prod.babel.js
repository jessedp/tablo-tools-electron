/**
 * Webpack config for production electron main process
 */

import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

// eslint-disable-next-line import/order
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

const { version } = require('../package.json');

CheckNodeEnv('production');

export default merge.smart(baseConfig, {
  devtool: 'source-map',

  mode: 'production',

  target: 'electron-main',

  entry: './app/main.dev',

  output: {
    path: path.join(__dirname, '..'),
    filename: './app/main.prod.js'
  },

  optimization: {
    minimizer: process.env.E2E_BUILD
      ? []
      : [
          new TerserPlugin({
            parallel: true,
            sourceMap: true,
            cache: true
          })
        ]
  },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false,
      START_MINIMIZED: false
    }),

    new webpack.DefinePlugin({
      'process.type': '"browser"'
    }),
    new SentryWebpackPlugin({
      include: '.',
      ignoreFile: '.sentrycliignore',
      ignore: [
        'node_modules',
        'configs',
        '_site',
        'flow-typed',
        'internals',
        'test',
        'dll',
        'babel.config.js',
        '.eslintrc'
      ],
      configFile: 'sentry.properties',
      dryRun: false,
      release: version,
      setCommits: {
        repo: 'jessedp/tablo-tools-electron',
        auto: true
      }
    })
  ],
  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false
  }
});
