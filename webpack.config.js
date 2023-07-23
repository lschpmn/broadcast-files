'use strict';

const { join } = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  devServer: {
    hot: true,
    port: 5000,
  },

  devtool: 'source-map',

  entry: [
    'webpack-hot-middleware/client',
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
              require.resolve('react-refresh/babel')
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

  plugins: [new webpack.HotModuleReplacementPlugin(), new ReactRefreshWebpackPlugin()],

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
};
