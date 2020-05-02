import { Router } from 'express';
import { db } from './index';
import {
  decryptCipherString,
  decryptString,
  encryptString,
  generateIV,
  parseEncryptedCipher,
  parseIV,
} from './lib/crypto';

export const AuthenticationRouter = Router();

AuthenticationRouter.use((req, res, next) => {
  const encryptedCipher = Buffer.from(parseEncryptedCipher(req.headers), 'base64').toString('binary');
  const privateKey = db.get('crypto.privateKey').value();
  const cipher = encryptedCipher ? decryptString(privateKey, encryptedCipher) : '';
  const iv = generateIV();

  if (req.method === 'POST') {
    const postIv = Buffer.from(parseIV(req.headers), 'base64').toString('binary');
    req.body = decryptCipherString(cipher, postIv, req.body);
  }

  const send = res.send.bind(res);
  // @ts-ignore
  res.send = (body: string | object | Buffer | null) => {
    if (body) {
      if (body instanceof Buffer) return send(body);

      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      const encryptedString = encryptString(cipher, iv, bodyStr);
      res.set('x-crypto-iv', Buffer.from(iv, 'binary').toString('base64'));
      send(encryptedString);
    } else send();
  };

  next();
});
