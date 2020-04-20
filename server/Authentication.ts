import { Router } from 'express';
import { db } from './index';
import { decryptCipherString, decryptString, encryptString, parseHeaders } from './lib/crypto';

export const AuthenticationRouter = Router();

AuthenticationRouter.use((req, res, next) => {
  const { encryptedCipher, iv } = parseHeaders(req.headers);
  const privateKey = db.get('crypto.privateKey').value();
  const cipher = decryptString(privateKey, encryptedCipher);

  if (typeof req.body === 'string') {
    req.body = decryptCipherString(cipher, iv, req.body);
  }

  const send = res.send.bind(res);
  // @ts-ignore
  res.send = (body: string | object) => {
    if (body) {
      const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
      const encryptedString = encryptString(cipher, iv, bodyStr);
      send(encryptedString);
    } else send();
  };

  next();
});
