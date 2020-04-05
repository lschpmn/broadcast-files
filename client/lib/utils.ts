import isEqual from 'lodash/isEqual';
import { createContext, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { JWT } from '../../types';

const domain = window.__DOMAIN__;
const jwtRegex = /auth=[^.]*\.([^.]*)\..*/;
const publicKeyStr = window.__PUBLIC_KEY__
  .replace('-----BEGIN PUBLIC KEY-----\n', '')
  .replace('-----END PUBLIC KEY-----\n', '');

export const useAction = <T extends Function>(action: T, deps?): T => {
  const dispatch = useDispatch();

  return useCallback((...args) =>
    dispatch(action(...args)), deps ? [dispatch, ...deps] : [dispatch]) as any;
};

export const arrayBufferToString = (ab: ArrayBuffer): string => {
  const array8Bit = new Uint8Array(ab);
  let str = '';
  for (let x = 0;x < array8Bit.length;x++) {
    str += String.fromCharCode(array8Bit[x]);
  }
  return str;
};

export const encryptString = async (str: string) => {
  const publicKey = await crypto.subtle.importKey(
    'spki',
    stringToArrayBuffer(atob(publicKeyStr)), //key
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    } as any,
    false,
    ['encrypt'],
  );
  const arrayBuffer = stringToArrayBuffer(str);
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    arrayBuffer,
  );

  return arrayBufferToString(encryptedBuffer);
};

export const JwtContext = createContext({});

export const stringToArrayBuffer = (str: string): ArrayBuffer => {
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

export const post = (path, body: string='{}') => fetch(
  `${domain}/api${path}`,
  {
    body: body,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    mode: 'cors',
  },
);
