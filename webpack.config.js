'use strict';

const { join } = require('path');

module.exports = {
  devServer: {
    hot: true,
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
        test: /\.(html|png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'file-loader?name=[name].[ext]',
      },
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
  },

  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
};
