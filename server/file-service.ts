import { Router } from 'express';
import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';
import { inspectAsync, listAsync } from 'fs-jetpack';
import { InspectResult } from 'fs-jetpack/types';
import { inspectNodeSendServer, setNode } from '../client/lib/reducers';
import { NodeShrub } from '../client/types';
import { DOWNLOAD_PREFIX, STREAM_PREFIX } from '../constants';
import { DirDetail, FileDetail, SocketFunctions } from '../types';
import db from './lib/db';
import { log } from './lib/utils';

// WEB SOCKET

export const methods: SocketFunctions = {};

methods[inspectNodeSendServer.toString()] = (emit) => async (pathname: string) => {
  log(`Inspecting pathname ${pathname}`);

  const node = await inspectAsync(getFilePath(pathname));
  if (!node) return;
  if (node.type === 'symlink') return;
  else if (node.type === 'file') {
    const file: FileDetail = {
      pathname,
      type: node.type,
      size: node.size,
    };
    emit(setNode({ [pathname]: file }), 'Found file');
    return;
  }
  const directory: DirDetail = {
    pathname,
    type: 'dir',
    nodePaths: [],
  };
  const nodeShrub: NodeShrub = {
    [pathname]: directory,
  };

  const nodeList = await listAsync(getFilePath(pathname));
  const inspectPromises = nodeList
    .map(name => inspectAsync(getFilePath(`${pathname}/${name}`))
      .then(n => n.type === 'symlink' ? null : n) // filter out symlinks
      .catch(() => false as any) as Promise<InspectResult>);

  (await Promise.all(inspectPromises))
    .filter(Boolean)
    .forEach(node => {
      const newPathname = `${pathname}/${node.name}`;

      directory.nodePaths.push(newPathname);
      nodeShrub[newPathname] = {
        pathname: newPathname,
        type: node.type as any,
        size: node.type === 'file' ? node.size : undefined,
      }
    });

  emit(setNode(nodeShrub));
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

const getVideoMetadata = (pathname: string): Promise<FfprobeData> => {
  return new Promise((res, rej) => {
    ffmpeg.ffprobe(pathname, (err, metadata) => {
      if (err) rej(err);
      else res(metadata);
    })
  });
};