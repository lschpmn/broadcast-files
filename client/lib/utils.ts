import isEqual from 'lodash/isEqual';
import { createContext, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { JWT } from '../../types';
import { decryptString, encryptString, getPublicKey } from './crypto';

const domain = window.__DOMAIN__;
const jwtRegex = /auth=[^.]*\.([^.]*)\..*/;

export const useAction = <T extends Function>(action: T, deps?): T => {
  const dispatch = useDispatch();

  return useCallback((...args) =>
    dispatch(action(...args)), deps ? [dispatch, ...deps] : [dispatch]) as any;
};

export const JwtContext = createContext({});

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

export const get = async (path) => {
  const publicKey = await getPublicKey();

  const response = await fetch(
    `${domain}/api${path}`,
    {
      credentials: 'include',
      headers: {
        key: publicKey,
      },
      method: 'GET',
      mode: 'cors',
    },
  );

  const encrypted = await response.text();
  console.log('encrypted');
  console.log(encrypted);
  const decrypted = await decryptString(encrypted);
  console.log('decrypted');
  console.log(decrypted);

  return JSON.parse(decrypted);
};

export const post = async (path, body: {}) => {
  console.log('POST request');
  console.log(body);

  const encryptedBody = await encryptString(JSON.stringify(body));
  const publicKey = await getPublicKey();

  return fetch(
    `${domain}/api${path}`,
    {
      body: encryptedBody,
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
        key: publicKey,
      },
      method: 'POST',
      mode: 'cors',
    },
  );
};
