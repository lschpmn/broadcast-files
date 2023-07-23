import express, { Express, Request, Response } from 'express';
import { Server as ServerType } from 'https';
import { join } from 'path';
import { Server, Socket } from 'socket.io';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.config';
import { log } from './lib/utils';


export const initClient = (app: Express, server: ServerType) => {
  // Webpack
  const compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, {}));
  app.use(webpackHotMiddleware(compiler));

  // Socket.IO
  const io = new Server(server, { maxHttpBufferSize: 1024 * 1024 * 500 /*500MB*/ });
  io.on('connection', (socket: Socket) => {
    log('client connected');

    socket.on('disconnect', () => log('client disconnected'));
  });

  // App Routes
  app.use(express.static(join(__dirname, '..', 'public')));

  app.use((req: Request, res: Response) => {
    log(`404 - ${req.url} - sending index.html`);
    res.sendFile(join(__dirname, '..', 'client', 'index.html'));
  });
};