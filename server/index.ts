import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { Express, Request, Response } from 'express';
import * as ffmpeg from 'fluent-ffmpeg';
import { readAsync as read, writeAsync as write } from 'fs-jetpack';
import * as getIncrementalPort from 'get-incremental-port';
import { join } from 'path';
import * as process from 'process';
import { AuthenticationRouter } from './Authentication';
import { DirectoriesRouter } from './Directories';
import { initCrypto } from './lib/crypto';
import { getPublicKey, initDB } from './lib/db';
import { setupUsers, UsersRouter } from './Users';

const IS_PROD = process.argv.includes('--prod');
const START_PORT = process.argv.includes('--port') ? process.argv.indexOf('--port') + 1 : 5000;

ffmpeg.setFfmpegPath(join(__dirname, '..', 'bin', 'ffmpeg.exe'));
ffmpeg.setFfprobePath(join(__dirname, '..', 'bin', 'ffprobe.exe'));

let app: Express;
let port;

async function startServer() {
  await initDB();
  port = await getIncrementalPort(START_PORT);
  app = express();

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

  app.listen(port, () => log(`started server on port ${port}`));
  await writePortToIndex();
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

async function writePortToIndex() {
  const index = await read(join(__dirname, '../client/index.html'));
  const publicKey = getPublicKey();
  const url = IS_PROD ? '' : `http://127.0.0.1:${port}`;
  const newIndex = index
    .replace('__DOMAIN__ = "";', `__DOMAIN__ = "${url}";`)
    .replace('__PUBLIC_KEY__ = "";', `__PUBLIC_KEY__ = \`${publicKey}\`;`);
  await write(join(__dirname, '../public/index.html'), newIndex);
  log(`wrote index.html file with port ${port}`);
}

startServer().catch(console.log);

function getPort(defaultPort: number): number {
  const portIndex = process.argv.indexOf('--port');
  if (portIndex > -1) return portIndex + 1;
  else defaultPort;
}
