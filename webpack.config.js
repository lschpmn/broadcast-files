'use strict';

const { join } = require('path');

module.exports = {
  devServer: {
    hot: true,
    port: 5000,
  },

  devtool: 'source-map',

  entry: [
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
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
};
