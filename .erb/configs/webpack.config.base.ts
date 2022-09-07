/**
 * Base webpack config used across other specific configs
 */

import webpack from 'webpack';
import webpackPaths from './webpack.paths';
import { dependencies as externals } from '../../release/app/package.json';
// import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
// const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
// import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

const configuration: webpack.Configuration = {
  externals: [...Object.keys(externals || {})],

  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
          },
        },
      },
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    alias: {
      // handlebars from https://github.com/handlebars-lang/handlebars.js/issues/953#issuecomment-239874313
      handlebars: 'handlebars/dist/handlebars.js',
    },
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    fallback: {
      // assert: false,
      child_process: false,
      // constants: false,
      constants: require.resolve('constants-browserify'),
      // crypto: false,
      crypto: require.resolve('crypto-browserify'),
      dgram: require.resolve('dgram-browserify'),
      // dgram: false,
      // domain: false,
      fs: false,
      http: require.resolve('stream-http'),
      // http: false,
      https: require.resolve('https-browserify'),
      // https: false,
      // net: require.resolve('net-browserify'),
      net: false,
      os: false,
      // os: require.resolve('os-browserify/browser'),
      // path: false,
      path: require.resolve('path-browserify'),
      tls: require.resolve('tls-browserify'),
      util: require.resolve('util/'),
      // util: false,
      // stream: false,
      stream: require.resolve('stream-browserify'),
      zlib: require.resolve('browserify-zlib'),
      // querystring: false,
      // url: false,
    },
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      FLUENTFFMPEG_COV: false,
    }),
    // new NodePolyfillPlugin({ excludeAliases: ['http', 'https'] }),
  ],
};

export default configuration;
