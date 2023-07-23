import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { MESSAGE_SEPARATOR } from '../../constants';
import { arrayBufferToString } from './crypto';

export const useAction = <T extends Function>(action: T, deps?): T => {
  const dispatch = useDispatch();

  return useCallback((...args) =>
    dispatch(action(...args)), deps ? [dispatch, ...deps] : [dispatch]) as any;
};

export const get = async (path) => {
  console.log(`GET ${path}`);

  const response = await fetch(
    `/api${path}`,
    {
      method: 'GET',
    },
  );

  return response.json();
};

export const stream = async (path: string, listener: (message: any) => void) => {
  console.log(`stream ${path}`);

  const response = await fetch(
    `/api${path}`,
    {
      method: 'GET',
    },
  );

  const reader = response.body.getReader();
  let done = false;
  let iv;

  while (!done) {
    const read = await reader.read();
    done = read.done;
    try {
      const messages = arrayBufferToString(read.value)
        .split(MESSAGE_SEPARATOR)
        .map(message => {
          try {
            return JSON.parse(message);
          } catch (err) {
            console.log('message parsing error');
            console.log(err);
            return null;
          }
        })
        .filter(Boolean);
      console.log('messages');
      console.log(messages);
      listener(messages);
    } catch (err) {
      console.log(err);
    }
  }
};
