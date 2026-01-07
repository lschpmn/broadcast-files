import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';
import { inspectAsync, listAsync } from 'fs-jetpack';
import { InspectResult } from 'fs-jetpack/types';
import { isImageFile, isVideoFile } from '../../client/lib/utils';
import { NodeShrub } from '../../client/types';
import { DirDetail, FileDetail } from '../../types';
import db from '../lib/db';

export const getFilePath = (path: string): string | null => {
  const route = db.getRoutes()
    .find(r => path.startsWith(r.url));

  if (!route) return null;

  // TODO: Make sure bad actor can't access parent directories
  return decodeURIComponent(path)
    .replace(route.url, route.filePath)
    .replace(/\//g, '\\');
};

export const inspectFile = async (pathname: string): Promise<FileDetail | null> => {
  // this is too focused on video, which was the point when I made it, but now I need it to cover images as well
  const isVideo = isVideoFile(pathname);
  if (!isImageFile(pathname) && !isVideoFile(pathname)) return null;
  const data = isVideo && await getVideoMetadata(getFilePath(pathname));
  const videoStream = isVideo && data.streams.find(stream => stream.height);

  return {
    pathname,
    size: isVideo && data.format.size,
    type: 'file',
    videoDetail: isVideo &&  {
      duration: data.format.duration,
      height: videoStream.height,
      width: videoStream.width,
    },
  };
};

export const inspectDir = async (pathname: string): Promise<NodeShrub> => {
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

  return nodeShrub;
};

const getVideoMetadata = (pathname: string): Promise<FfprobeData> => {
  return new Promise((res, rej) => {
    ffmpeg.ffprobe(pathname, (err, metadata) => {
      if (err) rej(err);
      else res(metadata);
    })
  });
};