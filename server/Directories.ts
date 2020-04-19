import { Router } from 'express';
import * as ffmpeg from 'fluent-ffmpeg';
import { dirAsync, inspectAsync as inspect, listAsync as list } from 'fs-jetpack';
import { InspectResult } from 'fs-jetpack/types';
// @ts-ignore
import * as intersection from 'lodash/intersection';
import { join } from 'path';
import { routes } from '../config';
import { DirectoryRoute, JWT } from '../types';
import { db, log } from './index';

export const DirectoriesRouter = Router();

DirectoriesRouter.get('/config', (req, res) => {
  const routesToShow = routes
    .filter(route => checkAccess(route, res.locals.user));

  res.send(routesToShow);
});

routes.forEach(route => {
  const dirBase = '/dir' + route.urlPath;
  DirectoriesRouter.get([dirBase, dirBase + '/*'], async (req, res) => {
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

      res.status(201).send(inspections);
    } catch (err) {
      console.log(err);
      res.status(500).send(err.message);
    }
  });

  const fileBase = '/file' + route.urlPath;
  DirectoriesRouter.get([fileBase, fileBase + '/*'], async (req, res) => {
    if (!checkAccess(route, res.locals.user)) return res.status(404).end();

    const path = join(route.filePath, decodeURIComponent(req.url.replace(fileBase, '')));
    log(`path - ${path}`);

    log('downloading file');
    res.on('close', () => log('stream closed'));
    return res.sendFile(path);
  });
});

DirectoriesRouter.post('/thumbnail', async (req, res) => {
  const path = req.body.path;

  if (db.has(['imageCache', path]).value()) {
    res.send({ path: db.get(['imageCache', path]).value() });
    return;
  }

  const id = Math.random().toString(36).slice(-8);
  const imagePath = join(__dirname, '..', 'public', 'images', id);
  await dirAsync(imagePath);

  ffmpeg(path)
    .on('error', (err) => {
      console.log(err);
      res.status(500).send({ error: err.message });
    })
    .on('end', async () => {
      const imagePath = `/images/${id}/1.png`;
      await db.set(['imageCache', path], imagePath).write();
      res.send({ path: imagePath });
    })
    .screenshots({
      filename: '1.png',
      folder: imagePath,
      size: '360x?',
      timemarks: ['10%'],
    });
});

const checkAccess = (route: DirectoryRoute, user?: JWT): boolean => {
  if (!route.canDownload) return false;
  if (typeof route.canDownload === 'boolean') {
    return true;
  }
  if (!user) return false;

  return !!intersection(route.canDownload, user.permissions).length;
};
