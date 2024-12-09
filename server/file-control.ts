import { Router } from 'express';
import { inspectAsync, listAsync } from 'fs-jetpack';
import { InspectResult } from 'fs-jetpack/types';
import { join } from 'path';
import { getConfigSendServer, getDirectoryListSendServer, setConfig, setDirectoryList } from '../client/lib/reducers';
import { DOWNLOAD_PREFIX, STREAM_PREFIX } from '../constants';
import db from './lib/db';
import { log, socketFunctions } from './lib/utils';

// WEB SOCKET

socketFunctions[getDirectoryListSendServer.toString()] = (emit) => async (pathName: string) => {
  log(`Request for path ${pathName}`);
  const filePath = getFilePath(pathName);

  if (!filePath) {
    log(`Route not found`);
    emit(setDirectoryList([]));
  }

  try {
    const directoryList = await listAsync(filePath);
    const inspectPromises = directoryList
      .map(item => inspectAsync(join(filePath, item)).catch(() => false as any as InspectResult));
    const inspections = (await Promise.all(inspectPromises)).filter(Boolean);

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
  const filePath = getFilePath(req.path.replace(DOWNLOAD_PREFIX, ''));
  if (!filePath) {
    log(`Route not found`);
    return res.sendStatus(404);
  }

  log(`start stream for - ${filePath}`);
  res.on('close', () => log(`stream ended for - ${filePath}`));

  res.sendFile(filePath);
});

fileRouter.get(STREAM_PREFIX + ' /*', (req, res) => {
  const filePath = getFilePath(req.path.replace(STREAM_PREFIX, ''));
  if (!filePath) {
    log(`Route not found`);
    return res.sendStatus(404);
  }

  res.send('hi!');
});

const getFilePath = (path: string): string | null => {
  const route = db.getRoutes()
    .find(r => path.startsWith(r.url));

  if (!route) return null;

  return decodeURIComponent(path)
    .replace(route.url, route.filePath)
    .replace(/\//g, '\\');
};
