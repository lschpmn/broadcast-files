import dayjs from 'dayjs';
import { Middleware } from 'redux';
import { io } from 'socket.io-client';
import { SERVER_MESSAGE } from '../../constants';

const socket = io();

const time = () => dayjs().format('hh:mm:ss.SSS A');

export const loggingMiddleware: Middleware = ({ getState }) => (next) => (action) => {
  console.log(`${time()} action`, action);
  next(action);
  setTimeout(() => console.log(`${time()} state`, getState()));
};

export const socketMiddleware: Middleware = ({ dispatch }) => {
  socket.on('action', (action) => dispatch(action));

  return (next) => (action) => {
    if (action.type.includes(SERVER_MESSAGE)) {
      socket.emit('message', action);
    }

    next(action);
  };
};
