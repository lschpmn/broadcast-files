import * as io from 'socket.io-client';

// @ts-ignore
const socket = io(`http://localhost:${window.__PORT__}`);

export default store => {
  socket.on('dispatch', action => store.dispatch(action));

  return next => action => {
    if (action.type.includes('@server')) socket.emit('dispatch', action);

    return next(action);
  };
};
