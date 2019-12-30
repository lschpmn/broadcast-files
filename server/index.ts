import * as cors from 'cors';
import * as express from 'express';
import { Request, Response } from 'express';
import { inspectAsync as inspect, listAsync as list, readAsync as read, writeAsync as write } from 'fs-jetpack';
import * as getIncrementalPort from 'get-incremental-port';
import { join } from 'path';
import { routes } from '../config';

const IS_PROD = process.argv.includes('--prod');
const START_PORT = 3000;
let retries = 10;
export let port;

(function serverRestarter() {
  startServer()
    .catch(err => {
      console.log(err);
      retries--;
      if (retries > 0) serverRestarter();
    });
})();

async function startServer() {
  port = await getIncrementalPort(START_PORT);
  await writePortToIndex();

  const app = express();

  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.url}`);
    next();
  });

  !IS_PROD && app.use(cors());

  IS_PROD && app.use('/all', express.static(join(__dirname, '..', 'public')));

  app.get('/config', (req: Request, res: Response) => {
    res.send(routes);
  });

  routes.forEach(route => {
    app.use(route.urlPath, async (req: Request, res: Response) => {
      const path = join(route.filePath, decodeURIComponent(req.url));
      console.log(`path - ${path}`);
      const inspection = await inspect(path);

      if (inspection.type === 'dir') {
        const files = await list(path);
        const inspections = await Promise.all(files.map(async file => await inspect(join(path, file))));

        return res.send(inspections);
      } else if (inspection.type === 'file') {
        console.log(inspection);
        console.log('streaming file');

        res.contentType('video/mp4');
        return res.sendFile(path);
      }

      console.log('got something else');
      console.log(inspection);
      res.send([])
    })
  });

  app.listen(port, () => console.log(`started server on port ${port}`));
}

async function writePortToIndex() {
  const index = await read(join(__dirname, '../client/index.html'));
  const url = IS_PROD ? '' : `http://127.0.0.1:${port}`;
  await write(
    join(__dirname, '../public/index.html'),
    index.replace('DOMAIN__ = ""', `DOMAIN__ = "${url}"`),
  );
  console.log(`wrote index.html file with port ${port}`);
}
