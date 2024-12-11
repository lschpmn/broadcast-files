import { Router } from 'express';
import { inspectAsync, listAsync } from 'fs-jetpack';
import { InspectResult } from 'fs-jetpack/types';
import { join } from 'path';
import { getConfigSendServer, getDirectoryListSendServer, setConfig, setDirectoryList } from '../client/lib/reducers';
import { DOWNLOAD_PREFIX, STREAM_PREFIX } from '../constants';
import db from './lib/db';
import { log, socketFunctions } from './lib/utils';
import ffmpeg from 'fluent-ffmpeg';

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
    .filter(route => [...route.canDownload, ...route.canStream].includes('guests'))
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

fileRouter.get(STREAM_PREFIX + '/*', (req, res) => {
  const filePath = getFilePath(req.path.replace(STREAM_PREFIX, ''));

  if (!filePath) {
    log(`Route not found`);
    return res.sendStatus(404);
  }

  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Content-Disposition', 'inline');

  console.log(`filePath: ${filePath}`);
  console.log(`headers: ${JSON.stringify(req.headers, null, 1)}`);

  ffmpeg(filePath)
    .seekInput((+req.query.t || 0))
    .format('mp4')
    .videoCodec('libx264')
    .audioCodec('libmp3lame')
    .outputOptions([
      '-movflags frag_keyframe+empty_moov', // Optimize for streaming
      '-preset ultrafast',                 // Low latency encoding
      '-tune zerolatency'                  // Reduce latency for streaming
    ])
    .on('error', error => {
      log('Streaming error');
      console.log(error);
    })
    .pipe(res, { end: true });
});

const getFilePath = (path: string): string | null => {
  const route = db.getRoutes()
    .find(r => path.startsWith(r.url));

  if (!route) return null;

  // TODO: Make sure bad actor can't access parent directories
  return decodeURIComponent(path)
    .replace(route.url, route.filePath)
    .replace(/\//g, '\\');
};
