import { Router } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import { inspectAsync, listAsync } from 'fs-jetpack';
import { join } from 'path';
import {
  getDirectoryListSendServer,
  getFileDetailsSendServer,
  setDirectoryList,
  setFileDetails,
} from '../client/lib/reducers';
import { DOWNLOAD_PREFIX, STREAM_PREFIX } from '../constants';
import { NodeDetail, SocketFunctions } from '../types';
import db from './lib/db';
import { log } from './lib/utils';

// WEB SOCKET

export const methods: SocketFunctions = {};

methods[getDirectoryListSendServer.toString()] = (emit) => async (pathname: string) => {
  log(`Request for path ${pathname}`);
  const filePath = getFilePath(pathname);

  if (!filePath) {
    log(`Route not found`);
    emit(setDirectoryList([]));
  }

  try {
    const directoryList = await listAsync(filePath);
    const inspectPromises = directoryList
      .map(item => inspectAsync(join(filePath, item))
        .then(n => n.type === 'symlink' ? null : n) // filter out symlinks
        .catch(() => false as any) as Promise<NodeDetail>
      );

    const inspections = (await Promise.all(inspectPromises)).filter(Boolean);

    emit(setDirectoryList(inspections), `Returning directory list with ${directoryList.length} items`);
  } catch (err) {
    console.error(`Error reading directory - ${decodeURIComponent(pathname)}`);
    console.error(err);
    emit(setDirectoryList([]), 'Failed inspecting path');
  }
};

methods[getFileDetailsSendServer.toString()] = (emit) => async (pathname: string) => {
  log(`Request for file details: ${pathname}`);
  const filePath = getFilePath(pathname);

  if (!filePath) {
    log(`File not found`);
    emit(setFileDetails(null));
    return;
  }

  const metadata = await new Promise((res, rej) =>
    ffmpeg.ffprobe(filePath, (err, metadata) => err ? rej(err) : res(metadata))) as any;

  const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');

  const fileDetail: NodeDetail = {
    name: pathname.split('/').slice(-1)[0],
    type: 'file',
    size: metadata.format.size,
    videoDetail: {
      duration: metadata.format.duration,
      height: videoStream?.height,
      width: videoStream?.width,
    },
  };

  emit(setFileDetails(fileDetail));
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

const getFilePath = (path: string): string | null => {
  const route = db.getRoutes()
    .find(r => path.startsWith(r.url));

  if (!route) return null;

  // TODO: Make sure bad actor can't access parent directories
  return decodeURIComponent(path)
    .replace(route.url, route.filePath)
    .replace(/\//g, '\\');
};
