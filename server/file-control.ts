import { Router } from 'express';
import { inspectAsync, listAsync } from 'fs-jetpack';
import { InspectResult } from 'fs-jetpack/types';
import { join } from 'path';
import { getConfigSendServer, getDirectoryListSendServer, setConfig, setDirectoryList } from '../client/lib/reducers';
import { DOWNLOAD_PREFIX } from '../constants';
import db from './lib/db';
import { log, socketFunctions } from './lib/utils';

// WEB SOCKET

socketFunctions[getDirectoryListSendServer.toString()] = (emit) => async (pathName: string) => {
  log(`Request for path ${pathName}`);
  const route = db
    .getRoutes()
    .find(route => pathName.startsWith(route.url));

  if (!route) {
    log('Route doesn\'t exist');
    emit(setDirectoryList([]));
  }

  try {
    const truePath = join(route.filePath, pathName.replace(route.url, ''));
    const directoryList = await listAsync(truePath);
    const inspectPromises = directoryList
      .map(item => inspectAsync(join(truePath, item)).catch(() => false as any as InspectResult));
    const inspections = (await Promise.all(inspectPromises))
      .filter(item => item);

    emit(setDirectoryList(inspections), `Returning directory list with ${directoryList.length} items`);
  } catch (err) {
    console.error(`Error reading directory - ${decodeURIComponent(pathName)}`);
    console.error(err);
    emit(setDirectoryList([]), 'Failed inspecting path');
  }
};

socketFunctions[getConfigSendServer.toString()] = (emit) => () => {
  const allowedRoutes = db.getRoutes()
    .filter(route => {
      if (typeof route.canDownload === 'boolean') return route.canDownload;
      else return false;
    })
    .map(route => ({
      label: route.label,
      url: route.url,
    }));

  emit(setConfig({ routes: allowedRoutes }));
};

// FILE ROUTER

export const fileRouter = Router();

fileRouter.get(DOWNLOAD_PREFIX + '/*', (req, res) => {
  const path = req.path.replace(DOWNLOAD_PREFIX, '');

  const route = db.getRoutes()
    .find(r => path.startsWith(r.url));

  if (!route) {
    log(`route not found`);
    return res.sendStatus(404);
  }

  const filePath = decodeURIComponent(path)
    .replace(route.url, route.filePath)
    .replace(/\//g, '\\');

  log(`start stream for - ${filePath}`);

  res.on('close', () => log(`stream ended for - ${filePath}`));

  res.sendFile(filePath);
});