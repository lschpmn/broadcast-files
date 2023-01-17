import { Middleware } from 'redux';
import { io } from 'socket.io-client';
import { SERVER_MESSAGE } from '../../constants';

const socket = io();

export const loggingMiddleware: Middleware = ({ getState }) => (next) => (action) => {
  console.log(`${(new Date()).toLocaleTimeString()} action`, action);
  console.log(`${(new Date()).toLocaleTimeString()} state`, getState());
  next(action);
};

export const socketMiddleware: Middleware = ({ dispatch }) => {
  socket.on('message', (action) => dispatch(action));

  return (next) => (action) => {
    if (action.type.includes(SERVER_MESSAGE)) {
      socket.emit('message', action);
    }

    next(action);
  };
};

export default [loggingMiddleware, socketMiddleware];
