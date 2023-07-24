import { Socket } from 'socket.io';
import { Action } from '../../types';
import { log } from './utils';


class BaseSocketConnection {
  socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  protected emit = (action: Action<any>, reason?: string) => {
    log(`Sending action ${action.type}` + (reason ? ` - ${reason}` : ''));
    this.socket.emit('action', action);
  };
}

export default BaseSocketConnection;
