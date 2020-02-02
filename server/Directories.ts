import { Request, Response } from 'express';
import { inspectAsync as inspect, listAsync as list } from 'fs-jetpack';
// @ts-ignore
import * as intersection from 'lodash/intersection';
import { join } from 'path';
import { routes } from '../config';
import { DirectoryRoute, JWT } from '../types';
import { app, log } from './index';

export const setupDirectories = () => {
  app.get('/config', (req: Request, res: Response) => {
    const routesToShow = routes
      .filter(route => checkAccess(route, res.locals.user));

    res.send(routesToShow);
  });

  routes.forEach(route => {
    const dirBase = '/dir' + route.urlPath;
    app.get([dirBase, dirBase + '/*'], async (req: Request, res: Response) => {
      if (!checkAccess(route, res.locals.user)) return res.status(404).end();

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
      if (!checkAccess(route, res.locals.user)) return res.status(404).end();

      const path = join(route.filePath, decodeURIComponent(req.url.replace(fileBase, '')));
      log(`path - ${path}`);

      log('downloading file');
      res.on('close', () => log('stream closed'));
      return res.sendFile(path);
    });
  });
};

const checkAccess = (route: DirectoryRoute, user?: JWT): boolean => {
  if (!route.canDownload) return false;
  if (typeof route.canDownload === 'boolean') {
    return true;
  }
  if (!user) return false;

  return !!intersection(route.canDownload, user.permissions).length;
};