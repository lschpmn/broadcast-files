import { inspectAsync, listAsync } from 'fs-jetpack';
import { InspectResult } from 'fs-jetpack/types';
import { join } from 'path';
import { Socket } from 'socket.io';
import { getDirectoryListSendServer, setDirectoryList } from '../client/lib/reducers';
import config from '../config.json';
import BaseSocketConnection from './lib/BaseSocketConnection';
import { log } from './lib/utils';


class Directory extends BaseSocketConnection {
  constructor(socket: Socket) {
    super(socket);

    socket.on(getDirectoryListSendServer.toString(), this.getDirectoryList);
  }

  getDirectoryList = async (pathName: string) => {
    log(`Request for path ${pathName}`);
    const route = config.routes.find(route => {
      return pathName.startsWith(route.url);
    });

    if (!route) {
      log('Route doesn\'t exist');
      this.emit(setDirectoryList([]));
    }

    try {
      const truePath = join(route.filePath, pathName.replace(route.url, ''));
      const directoryList = await listAsync(truePath);
      const inspectPromises = directoryList
        .map(item => inspectAsync(join(truePath, item)).catch(() => false as any as InspectResult));
      const inspections = (await Promise.all(inspectPromises))
        .filter(item => item);

      this.emit(setDirectoryList(inspections), `Returning directory list with ${directoryList.length} items`);
    } catch (err) {
      console.error(`Error reading directory - ${decodeURIComponent(pathName)}`);
      console.error(err);
      this.emit(setDirectoryList([]), 'Failed inspecting path');
    }
  };
}

export default Directory;
