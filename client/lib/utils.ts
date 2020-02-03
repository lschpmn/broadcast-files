import isEqual from 'lodash/isEqual';
import { createContext, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { JWT } from '../../types';
import { CustomWindowProperties } from '../types';

const domain = (window as any as CustomWindowProperties).__DOMAIN__;
const jwtRegex = /auth=[^.]*\.([^.]*)\..*/;

export const useAction = <T extends Function>(action: T, deps?): T => {
  const dispatch = useDispatch();

  return useCallback((...args) =>
    dispatch(action(...args)), deps ? [dispatch, ...deps] : [dispatch]) as any;
};

export const JwtContext = createContext({});

export  const  str2ab = (str: string): ArrayBuffer => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};

export const useJwt = () => {
  const [jwt, setJwt] = useState({} as JWT);

  useEffect(() => {
    const interval = setInterval(() => {
      const cookies = document.cookie.split(';').map(c => c.trim());
      const authCookie = cookies.find(cookie => cookie.startsWith('auth'));

      if (authCookie) {
        const [, base64Jwt] = jwtRegex.exec(authCookie);
        const actualJwt = JSON.parse(atob(base64Jwt));
        if (!isEqual(actualJwt, jwt)) setJwt(actualJwt);
      } else if (jwt.username) setJwt({} as any);
    }, 1000);

    return () => clearInterval(interval);
  }, [jwt]);

  return jwt;
};

export const get = (path) => fetch(
  `${domain}/api${path}`,
  {
    credentials: 'include',
    method: 'GET',
    mode: 'cors',
  },
);

export const post = (path, body?: Object) => fetch(
  `${domain}/api${path}`,
  {
    body: body ? JSON.stringify(body) : '{}',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    mode: 'cors',
  },
);
