'use strict';

const { join } = require('path');

module.exports = {
  devServer: {
    port: 5000,
  },

  devtool: 'source-map',

  entry: [
    'react-hot-loader/patch',
    './client/index.tsx',
  ],

  mode: 'development',

  module: {
    rules: [
      {
        test: /.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-typescript',
              '@babel/preset-react',
              '@babel/preset-env',
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-optional-chaining',
              'react-hot-loader/babel',
            ],
          },
        },
      },
    ],
  },

  output: {
    filename: 'bundle.js',
    path: join(__dirname, 'public/'),
    publicPath: '/',
  },

  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
};
