import { Router } from 'express';
import { inspectAsync, listAsync } from 'fs-jetpack';
import { InspectResult } from 'fs-jetpack/types';
import { join } from 'path';
import { getConfigSendServer, getDirectoryListSendServer, setConfig, setDirectoryList } from '../client/lib/reducers';
import config from '../config.json';
import { log, socketFunctions } from './lib/utils';

// WEB SOCKET

socketFunctions[getDirectoryListSendServer.toString()] = (emit) => async (pathName: string) => {
  log(`Request for path ${pathName}`);
  const route = config.routes.find(route => {
    return pathName.startsWith(route.url);
  });

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
  const allowedRoutes = config.routes
    .filter(route => {
      if (typeof route.canDownload === 'boolean') return route.canDownload;
      else return false;
    })
    .map(route => {
      const { label, url } = route;
      return { label, url };
    });

  emit(setConfig({ routes: allowedRoutes }));
};

// FILE ROUTER

export const fileRouter = Router();

fileRouter.get('/*', (req, res) => {
  const route = config.routes
    .find(r => req.path.startsWith(r.url));

  if (!route) {
    log(`route not found`);
    return res.sendStatus(404);
  }

  const filePath = decodeURIComponent(req.path)
    .replace(route.url, route.filePath)
    .replace(/\//g, '\\');

  log(`start stream for - ${filePath}`);

  res.on('close', () => log(`stream ended for - ${filePath}`));

  res.sendFile(filePath);
});