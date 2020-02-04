import { inspectAsync as inspect, listAsync as list } from 'fs-jetpack';
import { InspectResult } from 'fs-jetpack/types';
// @ts-ignore
import * as intersection from 'lodash/intersection';
import { join } from 'path';
import { routes } from '../config';
import { DirectoryRoute, JWT } from '../types';
import { app, log } from './index';

export const setupDirectories = () => {
  app.get('/api/config', (req, res) => {
    const routesToShow = routes
      .filter(route => checkAccess(route, res.locals.user));

    res.send(routesToShow);
  });

  routes.forEach(route => {
    const dirBase = '/api/dir' + route.urlPath;
    app.get([dirBase, dirBase + '/*'], async (req, res) => {
      if (!checkAccess(route, res.locals.user)) return res.status(404).end();

      const path = join(route.filePath, decodeURIComponent(req.url.replace(dirBase, '')));
      log(`path - ${path}`);

      try {
        const files = await list(path);
        const inspections: InspectResult[] = await Promise.all(files.map(async file => {
          const filePath = join(path, file);
          try {
            return await inspect(filePath);
          } catch (err) {
            console.log(`error with ${filePath}`);
            return { type: 'forbidden' } as any;
          }
        }));
        inspections
          // @ts-ignore
          .filter(file => file.type !== 'forbidden')
          .sort((aItem, bItem) => {
            if (aItem.type === 'file' && bItem.type === 'file') {
              return aItem.name.localeCompare(bItem.name);
            } else if (aItem.type === 'file' && bItem.type !== 'file') {
              return -1;
            } else if (aItem.type !== 'file' && bItem.type === 'file') {
              return 1;
            }

            return aItem.name.localeCompare(bItem.name);
          });

        res.send(inspections);
      } catch (err) {
        res.status(500).send(err.message);
      }
    });

    const fileBase = '/api/file' + route.urlPath;
    app.get([fileBase, fileBase + '/*'], async (req, res) => {
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
