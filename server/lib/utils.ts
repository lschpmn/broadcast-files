import dayjs from 'dayjs';

export const getCommandLineArguments = (): { PORT: number, DEVELOP: boolean } => {
  const { argv } = process;
  const portIndex = argv.indexOf('--port');
  const port = portIndex > -1 ? +argv[portIndex + 1] : 0;

  if (!port) {
    console.error('--port must be defined!');
    process.exit();
  }

  return {
    PORT: port,
    DEVELOP: argv.includes('--development'),
  };
};

export const log = (message: string) =>
  console.log(`${dayjs().format('hh:mm:ss.SSSA ddd MM/DD/YY')} - ${message}`);
