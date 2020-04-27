import isEqual from 'lodash/isEqual';
import { createContext, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { JWT } from '../../types';
import { arrayBufferToString, decryptString, encryptString, generateIV, getSecureKey } from './crypto';

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
  console.log(`GET ${path}`);
  const secureKey = await getSecureKey();

  const response = await fetch(
    `${domain}/api${path}`,
    {
      credentials: 'include',
      headers: {
        'x-crypto-key': btoa(secureKey),
      },
      method: 'GET',
      mode: 'cors',
    },
  );

  const encrypted = await response.text();
  if (encrypted) {
    const iv = atob(response.headers.get('x-crypto-iv'));
    const decrypted = await decryptString(iv, encrypted);
    console.log(decrypted);

    return JSON.parse(decrypted);
  } else return null;
};

export const post = async (path, body: {}) => {
  console.log(`POST request ${path}`);
  console.log(body);

  const iv = generateIV();
  const secureKey = await getSecureKey();
  const encryptedBody = await encryptString(iv, JSON.stringify(body));

  const response = await fetch(
    `${domain}/api${path}`,
    {
      body: encryptedBody,
      credentials: 'include',
      headers: {
        'x-crypto-iv': btoa(arrayBufferToString(iv)),
        'x-crypto-key': btoa(secureKey),
      },
      method: 'POST',
      mode: 'cors',
    },
  );

  const encrypted = await response.text();
  if (encrypted) {
    const responseIv = atob(response.headers['x-crypto-iv']);
    const decrypted = await decryptString(responseIv, encrypted);
    console.log('decrypted');
    console.log(decrypted);

    return JSON.parse(decrypted);
  } else return null;
};

export const stream = async (path: string) => {
  console.log(`stream ${path}`);
  const secureKey = await getSecureKey();

  /*const xhr = new XMLHttpRequest();
  xhr.open("GET", `${domain}/api${path}`, true);
  xhr.onprogress = function () {
    //responseText contains ALL the data received
    console.log("PROGRESS:", xhr.responseText)
  };
  xhr.send();*/

  const response = await fetch(
    `${domain}/api${path}`,
    {
      credentials: 'include',
      headers: {
        'x-crypto-key': btoa(secureKey),
      },
      method: 'GET',
      mode: 'cors',
    },
  );

  const body = response.body.getReader();
  console.log(await body.read());
  console.log(await body.read());
  console.log(await body.read());
  console.log(await body.read());

  /*const encrypted = await response.text();

  if (encrypted) {
    const iv = atob(response.headers.get('x-crypto-iv'));
    const decrypted = await decryptString(iv, encrypted);
    console.log('decrypted');
    console.log(decrypted);

    return JSON.parse(decrypted);
  } else return null;*/
};
