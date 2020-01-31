import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { CustomWindowProperties } from '../types';

const domain = (window as any as CustomWindowProperties).__DOMAIN__;

export const useAction = <T extends Function>(action: T, deps?): T => {
  const dispatch = useDispatch();

  return useCallback((...args) =>
    dispatch(action(...args)), deps ? [dispatch, ...deps] : [dispatch]) as any;
};

export const jsonPostRequest = (body: Object) => fetch(
  `${domain}/api/users/login`,
  {
    body: JSON.stringify(body),
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    mode: 'cors',
  });
