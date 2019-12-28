const { app, BrowserWindow } = require('electron');
const getIncrementalPort = require('get-incremental-port');
const _ = require('lodash');
const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('./webpack.config.js');

let port;
let win;

const openWindow = _.after(2, createWindow);

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
    openWindow();
  });
})();

function createWindow() {
  win = new BrowserWindow({
    height: 720,
    webPreferences: {
      nodeIntegration: true,
    },
    width: 1280,
  });

  win.loadURL(`http://localhost:${port}/index.html`);

  win.webContents.openDevTools();

  win.on('closed', () => {
    app.quit();
  });
}

app.on('ready', openWindow);

app.on('window-all-closed', () => {
  app.quit();
});
