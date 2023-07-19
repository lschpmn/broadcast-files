import dayjs from 'dayjs';

export const log = (message: string) =>
    console.log(`${dayjs().format('hh:mm:ss.SSS A ddd MMM DD YYYY')} - ${message}`);