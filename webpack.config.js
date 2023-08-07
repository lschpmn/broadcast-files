'use strict';

const { join } = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const webpack = require('webpack');

const isDevelopment = process.env.NODE_ENV !== 'production';

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
              isDevelopment && require.resolve('react-refresh/babel')
            ].filter(Boolean),
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

  plugins: [new webpack.HotModuleReplacementPlugin(), isDevelopment && new ReactRefreshWebpackPlugin()].filter(Boolean),

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
};
