import { join } from 'path';
import { spawn } from 'child_process';
import * as nodemon from 'nodemon';
const getIncrementalPort = require('get-incremental-port');
const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const config = require('./webpack.config.js');

const IS_PROD = process.argv.includes('--prod');
const START_PORT = 5000;
const TS_NODE_PATH = join(__dirname, 'node_modules', '.bin', 'ts-node.cmd');

(async function () {
  if (IS_PROD) {
    const serverPort = await getIncrementalPort(START_PORT);
    startServer(serverPort);
  } else {
    const webpackPort = await getIncrementalPort(START_PORT);
    const serverPort = await getIncrementalPort(START_PORT);

    startNodemon(serverPort);
    startWebpack(webpackPort, serverPort);
  }
})();

function startNodemon(port: number) {
  console.log('Starting server');
  nodemon({
    args: ['--port', port.toString()],
    ext: 'ts',
    execMap: {
      'ts': TS_NODE_PATH,
    },
    script: join(__dirname, 'server', 'index.ts'),
    watch: [join(__dirname, 'server')],
  });
}

function startServer(serverPort: number) {
  console.log('Starting server in prod mode');
  const serverProcess = spawn(TS_NODE_PATH, ['server/index.ts', '--port', serverPort.toString(), '--prod']);

  serverProcess.stdout.on('data', data => console.log(data.toString()));
  serverProcess.stderr.on('data', data => console.log(data.toString()));
}

function startWebpack(webpackPort, serverPort) {
  console.log('starting webpack');
  const compiler = webpack(config);
  const server = new webpackDevServer(compiler, {
    contentBase: './public',
    historyApiFallback: {
      disableDotRule: true,
    },
    hot: true,
  });

  server.listen(webpackPort, () => console.log(`starting on ${webpackPort}`));
}
