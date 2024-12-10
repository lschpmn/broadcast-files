import dayjs from 'dayjs';
import { Middleware } from 'redux';
import { io } from 'socket.io-client';
import { Action } from '../../types';

const socket = io();

const time = () => dayjs().format('hh:mm:ss.SSSA');

export const loggingMiddleware: Middleware = ({ getState }) => (next) => (action) => {
  console.log(`${time()} action`, action);
  next(action);
  setTimeout(() => console.log(`${time()} state`, getState()));
};

export const socketMiddleware: Middleware = ({ dispatch }) => {
  socket.on('action', (action) => dispatch(action));

  return (next) => (action: Action<any>) => {
    if (action.type.includes('SendServer')) {
      socket.emit(action.type, action.payload);
    }

    next(action);
  };
};
