import { Socket } from 'socket.io';
import { set } from '../client/lib/reducers';
import config from '../config.json';
import BaseSocketConnection from './lib/BaseSocketConnection';

class Config extends BaseSocketConnection {

  constructor(socket: Socket) {
    super(socket);

    this.sendRoutes();
  }

  sendRoutes() {
    const allowedRoutes = config.routes
      .filter(route => {
        if (typeof route.canDownload === 'boolean') return route.canDownload;
        else return false;
      })
      .map(route => {
        const { label, url } = route;
        return { label, url };
      });

    this.emit(set({ routes: allowedRoutes }));
  }
}

export default Config;
