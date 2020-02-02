import { Request, Response } from 'express';
import { inspectAsync as inspect, listAsync as list } from 'fs-jetpack';
import { join } from 'path';
import { routes } from '../config';
import { app, log } from './index';

export const setupDirectories = () => {
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
};
