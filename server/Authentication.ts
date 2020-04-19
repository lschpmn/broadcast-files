import { Router } from 'express';
import { db } from './index';
import { decryptString, encryptString, parseHeaders } from './lib/crypto';

export const AuthenticationRouter = Router();

AuthenticationRouter.use((req, res, next) => {
  const privateKey = db.get('crypto.privateKey').value();

  if (typeof req.body === 'string') {
    try {
      req.body = decryptString(privateKey, req.body);
    } catch (err) {
      console.log('decryption error');
      console.log(err);
    }
  }

  const { encryptedCipher, iv } = parseHeaders(req.headers);
  const cipher = decryptString(privateKey, encryptedCipher);

  const send = res.send.bind(res);
  // @ts-ignore
  res.send = (body: string | object) => {
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const encryptedString = encryptString(cipher, iv, bodyStr);
    send(encryptedString);
  };

  next();
});
