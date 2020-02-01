import * as cors from 'cors';
import * as express from 'express';
import { Express, Request, Response } from 'express';
import { inspectAsync as inspect, listAsync as list, readAsync as read, writeAsync as write } from 'fs-jetpack';
import * as getIncrementalPort from 'get-incremental-port';
import * as lowdb from 'lowdb';
import { LowdbAsync } from 'lowdb';
import * as FileAsync from 'lowdb/adapters/FileAsync';
import { join } from 'path';
import { routes } from '../config';
import { DbSchema } from '../types';
import { setupUsers } from './Users';
import * as cookieParser from 'cookie-parser';

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
  await writePortToIndex();

  const adapter = new FileAsync(join(__dirname, '..', 'db.json'));
  app = express();
  db = await lowdb(adapter);

  db
    .defaults({
      crypto: {},
      users: [],
    })
    .write()
    .catch(console.log);

  app.use((req, res, next) => {
    log(`url - ${req.url}`);
    next();
  });

  !IS_PROD && app.use(cors({ credentials: true, origin: 'http://127.0.0.1:5000' }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.static(join(__dirname, '..', 'public')));

  await setupUsers();

  app.get('/config', (req: Request, res: Response) => {
    res.send(routes);
  });

  routes.forEach(route => {
    const dirBase = '/dir' + route.urlPath;
    app.get([dirBase, dirBase + '/*'], async (req: Request, res: Response) => {
      const path = join(route.filePath, decodeURIComponent(req.url.replace(dirBase, '')));
      log(`path - ${path}`);

      try {
        const files = await list(path);
        const inspections = await Promise.all(files.map(async file => await inspect(join(path, file))));

        res.send(inspections);
      } catch (err) {
        res.status(500).send(err.message);
      }
    });

    const fileBase = '/file' + route.urlPath;
    app.get([fileBase, fileBase + '/*'], async (req: Request, res: Response) => {
      const path = join(route.filePath, decodeURIComponent(req.url.replace(fileBase, '')));
      log(`path - ${path}`);

      log('downloading file');
      res.on('close', () => log('stream closed'));
      return res.sendFile(path);
    });
  });

  app.use((req: Request, res: Response) => {
    log(`404 - sending index.html - ${req.url}`);
    res.sendFile(join(__dirname, '..', 'public', 'index.html'));
  });

  app.listen(port, () => log(`started server on port ${port}`));
}

// @ts-ignore
const log = (message: string) => console.log(`${new Date().toLocaleString(undefined, {
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
  const url = IS_PROD ? '' : `http://127.0.0.1:${port}`;
  await write(
    join(__dirname, '../public/index.html'),
    index.replace('DOMAIN__ = ""', `DOMAIN__ = "${url}"`),
  );
  log(`wrote index.html file with port ${port}`);
}
