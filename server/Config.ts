import { Socket } from 'socket.io';
import { set } from '../client/lib/reducers';
import config from '../config.json';


class Config {
  constructor(socket: Socket) {
    socket.emit('action', set(config));
  }
}

export default Config;