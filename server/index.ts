import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { read } from 'fs-jetpack';
import { createServer } from 'https';
import { join } from 'path';
import process from 'process';
import { Server, Socket } from 'socket.io';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.config';
import { AuthenticationRouter } from './Authentication';
import { DirectoriesRouter } from './Directories';
import { initCrypto } from './lib/crypto';
import { initDB } from './lib/db';
import { setupUsers, UsersRouter } from './Users';

const IS_PROD = process.argv.includes('--prod');
const PORT = process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : 5000;

ffmpeg.setFfmpegPath(join(__dirname, '..', 'bin', 'ffmpeg.exe'));
ffmpeg.setFfprobePath(join(__dirname, '..', 'bin', 'ffprobe.exe'));

let app: Express;
// command to make ssl cert
// openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout server.key -out server.cert
async function startServer() {
  app = express();
  const server = createServer({
    key: read(join(__dirname, '../server.key')),
    cert: read(join(__dirname, '../server.cert')),
  }, app);
  await initDB();

  // Webpack
  const compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, {}));
  app.use(webpackHotMiddleware(compiler));

  const io = new Server(server, { maxHttpBufferSize: 1024 * 1024 * 500 /*500MB*/ });
  io.on('connection', (socket: Socket) => {
    console.log('client connected');
  });

  app.use((req, res, next) => {
    const ip = req.header('x-real-ip'); // ip address from nginx
    log(`ip - ${ip || req.ip} - url - ${req.url}`);
    next();
  });

  !IS_PROD && app.use(cors({
    allowedHeaders: ['x-crypto-iv', 'x-crypto-key'],
    credentials: true,
    exposedHeaders: 'x-crypto-iv',
    origin: true,
  }));

  app.use(cookieParser());
  app.use(express.text());
  app.use(express.static(join(__dirname, '..', 'public')));

  await initCrypto();
  await setupUsers();

  app.use('/api', AuthenticationRouter);
  app.use('/api', UsersRouter);
  app.use('/api', DirectoriesRouter);
  app.use('/api', (req, res) => res.status(404).end());

  app.use((err, req, res, next) => {
    log(err);
    log(err.stack);
    res.status(500).send(err);
  });

  app.use((req: Request, res: Response) => {
    log(`404 - sending index.html - ${req.url}`);
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });

  server.listen(PORT, () => log(`started server at https://localhost:${PORT}`));
}

// @ts-ignore
export const log = (message: string) => console.log(`${new Date().toLocaleString(undefined, {
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  month: 'short',
  second: '2-digit',
  weekday: 'short',
  year: 'numeric',
})} - ${message}`);

startServer().catch(console.log);
