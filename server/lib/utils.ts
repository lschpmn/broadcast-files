import dayjs from 'dayjs';
import { Request } from 'express';
import { Handshake } from 'socket.io/dist/socket-types';
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '../../constants';

const PROD_PORT = 50105;

export const isImageFile = (file: string = '') =>
  IMAGE_EXTENSIONS.some(v => file.endsWith(v));

export const isVideoFile = (file: string = '') =>
  VIDEO_EXTENSIONS.some(v => file.endsWith(v));

export const getCommandLineArguments = (): { PORT: number, DEVELOP: boolean } => {
  const { argv } = process;
  const portIndex = argv.indexOf('--port');
  const port = portIndex > -1 ? +argv[portIndex + 1] : 0;

  return {
    PORT: port || PROD_PORT,
    DEVELOP: argv.includes('--development'),
  };
};

export const log = (message?: string, req: Request = null, handshake: Handshake = null) => {
  let consoleStr = dayjs().format('hh:mm:ss.SSSA ddd MM/DD/YY');

  if (req) {
    const ip = (req.header('x-real-ip') || req.ip).replace('::ffff:', '');
    consoleStr += ` - ip:${ip} - url:${req.url}`;
  } else if (handshake) {
    const ip = (handshake.headers['x-real-ip'] as string || handshake.address).replace('::ffff:', '');
    consoleStr += ` - ip:${ip}`;
  }

  if (message) {
    consoleStr += ' - ' + message;
  }

  console.log(consoleStr);
};
