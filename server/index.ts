import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { Express, Request, Response } from 'express';
import { readAsync as read, writeAsync as write } from 'fs-jetpack';
import * as getIncrementalPort from 'get-incremental-port';
import * as lowdb from 'lowdb';
import { LowdbAsync } from 'lowdb';
import * as FileAsync from 'lowdb/adapters/FileAsync';
import { join } from 'path';
import { DbSchema } from '../types';
import { setupDirectories } from './Directories';
import { initCrypto, setupUsers } from './Users';

const IS_PROD = process.argv.includes('--prod');
const START_PORT = 3000;
let retries = 10;
export let app: Express;
export let db: LowdbAsync<DbSchema>;
export let port;

(function serverRestarter() {
  startServer()
    .catch(err => {
      log('error');
      console.log(err);
      retries--;
      if (retries > 0) serverRestarter();
    });
})();

async function startServer() {
  port = await getIncrementalPort(START_PORT);

  const adapter = new FileAsync(join(__dirname, '..', 'db.json'));
  app = express();
  db = await lowdb(adapter);

  await db
    .defaults({
      crypto: {},
      imageCache: {},
      users: {},
    })
    .write();

  await initCrypto();
  await writePortToIndex();

  app.use((req, res, next) => {
    log(`url - ${req.url}`);
    next();
  });

  !IS_PROD && app.use(cors({ credentials: true, origin: 'http://127.0.0.1:5000' }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.static(join(__dirname, '..', 'public')));

  await setupUsers();
  setupDirectories();

  app.use('/api', (req, res) => res.status(404).end());

  app.use((req: Request, res: Response) => {
    log(`404 - sending index.html - ${req.url}`);
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });

  app.listen(port, () => log(`started server on port ${port}`));
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
  const publicKey = db.get('crypto.publicKey').value();
  const url = IS_PROD ? '' : `http://127.0.0.1:${port}`;
  const newIndex = index
    .replace('__DOMAIN__ = "";', `__DOMAIN__ = "${url}";`)
    .replace('__PUBLIC_KEY__ = "";', `__PUBLIC_KEY__ = \`${publicKey}\`;`);
  await write(join(__dirname, '../public/index.html'), newIndex);
  log(`wrote index.html file with port ${port}`);
}
