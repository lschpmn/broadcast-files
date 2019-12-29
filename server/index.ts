import { Request, Response } from 'express';
import { readAsync as read, writeAsync as write, listAsync as list, inspectAsync as inspect } from 'fs-jetpack';
import * as getIncrementalPort from 'get-incremental-port';
import * as express from 'express';
import { join } from 'path';
import { routes } from '../config';
import * as cors from 'cors';

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
  app.use(cors());

  app.get('/config', (req: Request, res: Response) => {
    res.send(routes);
  });

  routes.forEach(route => {
    app.use(route.urlPath, async (req: Request, res: Response) => {
      const path = join(route.filePath, decodeURIComponent(req.url));
      console.log(path);
      const inspection = await inspect(path);

      if (inspection.type === 'dir') {
        const files = await list(path);
        const inspections = await Promise.all(files.map(async file => await inspect(join(path, file))));

        return res.send(inspections);
      } else if (inspection.type === 'file') {
        console.log(inspection);
        return res.send(inspection);
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
  await write(
    join(__dirname, '../public/index.html'),
    index.replace('PORT__ = 0', `PORT__ = ${port}`),
  );
  console.log(`wrote index.html file with port ${port}`);
}
