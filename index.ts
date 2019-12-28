const getIncrementalPort = require('get-incremental-port');
const _ = require('lodash');
const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('./webpack.config.js');

let port;

(async function () {
  port = await getIncrementalPort(5000);
  const options = {
    contentBase: './public',
    hot: true,
    host: 'localhost',
  };

  webpackDevServer.addDevServerEntrypoints(config, options);
  const compiler = webpack(config);
  const server = new webpackDevServer(compiler, options);

  server.listen(port, '', () => {
    console.log(`dev server listening on port ${port}`);
  });
})();
