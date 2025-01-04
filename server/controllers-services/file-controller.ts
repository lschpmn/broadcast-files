import { Router } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { inspectAsync } from 'fs-jetpack';
import { inspectNodeSendServer, setNode, setNodeShrub } from '../../client/lib/reducers';
import { DOWNLOAD_PREFIX, STREAM_PREFIX } from '../../constants';
import { SocketFunctions } from '../../types';
import db from '../lib/db';
import { log } from '../lib/utils';
import { getFilePath, inspectDir, inspectFile } from './file-service';

// WEB SOCKET

export const methods: SocketFunctions = {};

methods[inspectNodeSendServer.toString()] = (emit) => async (pathname: string) => {
  log(`Inspecting pathname ${pathname}`);
  const node = await inspectAsync(getFilePath(pathname));

  if (!node || node.type === 'symlink') return;
  if (node.type === 'file') {
    const fileData = await inspectFile(pathname);
    fileData
      ? emit(setNode(fileData), 'Video file inspected')
      : emit(setNode({ pathname, size: node.size, type: 'file' }), 'File inspected');
  } else {
    const shrub = await inspectDir(pathname);
    emit(setNodeShrub(shrub));
  }
};

export const getAllowedRoutes = () => {
  return db.getRoutes()
    .filter(route => [...route.canDownload, ...route.canStream].includes('guests'))
    .map(route => ({
      label: route.label,
      url: route.url,
    }));
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

  log(`FilePath: ${filePath}`);
  console.log(`Range Header: ${req.headers.range}`);

  ffmpeg(filePath)
    .seekInput((+req.query.t || 0))
    .format('mp4')
    .videoCodec('libx264')
    .audioCodec('libmp3lame')
    .outputOptions([
      '-movflags frag_keyframe+empty_moov', // Optimize for streaming
      '-preset ultrafast',                 // Low latency encoding
      '-tune zerolatency',                  // Reduce latency for streaming
    ])
    .on('error', error => {
      log('Streaming error');
      console.log(error);
    })
    .pipe(res, { end: true });
});
