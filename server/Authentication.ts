import { Router } from 'express';
import { MESSAGE_SEPARATOR } from '../constants';
import { db } from './index';
import {
  atob,
  btoa,
  decryptCipherString,
  decryptString,
  encryptString,
  generateIV,
  parseEncryptedCipher,
  parseIV,
} from './lib/crypto';

export const AuthenticationRouter = Router();

AuthenticationRouter.use((req, res, next) => {
  const encryptedCipher = parseEncryptedCipher(req.headers);
  const privateKey = db.get('crypto.privateKey').value();
  const cipher = encryptedCipher ? decryptString(privateKey, atob(encryptedCipher)) : '';
  const iv = generateIV();

  if (req.method === 'POST') {
    const postIv = atob(parseIV(req.headers));
    req.body = decryptCipherString(cipher, postIv, req.body);
  }

  const send = res.send.bind(res);
  // @ts-ignore
  res.send = (body: string | object | Buffer | null) => {
    if (body) {
      if (body instanceof Buffer) return send(body);

      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      const encryptedString = encryptString(cipher, iv, bodyStr);
      res.set('x-crypto-iv', btoa(iv));
      send(encryptedString);
    } else send();
  };

  let sentIv = false;
  // @ts-ignore
  res.encryptedWrite = (chunk: object | string) => {
    if (!sentIv) {
      res.write(btoa(iv) + MESSAGE_SEPARATOR);
      sentIv = true;
    }

    let encryptedMessage;
    if (typeof chunk === 'string') {
      encryptedMessage = encryptString(cipher, iv, chunk);
    } else {
      encryptedMessage = encryptString(cipher, iv, JSON.stringify(chunk));
    }

    res.write((btoa(encryptedMessage)) + MESSAGE_SEPARATOR);
  };

  next();
});
