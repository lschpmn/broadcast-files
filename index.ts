const getIncrementalPort = require('get-incremental-port');
const _ = require('lodash');
const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('./webpack.config.js');

(async function () {
  const port = await getIncrementalPort(5000);

  const options = {
    contentBase: './public',
    historyApiFallback: {
      disableDotRule: true,
    },
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
