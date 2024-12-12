import dayjs from 'dayjs';
import { SocketFunction } from '../../types';

export const getCommandLineArguments = (): { PORT: number, PROD: boolean } => {
  const { argv } = process;
  const portIndex = argv.indexOf('--port');
  const port = portIndex > -1 ? +argv[portIndex + 1] : 0;

  if (!port) {
    console.error('--port must be defined!');
    process.exit();
  }

  return {
    PORT: port,
    PROD: argv.includes('--prod') || argv.includes('--production'),
  };
};

export const log = (message: string) =>
  console.log(`${dayjs().format('hh:mm:ss.SSSA ddd MM/DD/YY')} - ${message}`);

export const socketFunctions: SocketFunction = {};