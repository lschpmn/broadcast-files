import { Router } from 'express';
import { db } from './index';
import { decryptString } from './lib/crypto';

export const AuthenticationRouter = Router();

AuthenticationRouter.use(async (req, res, next) => {
  if (typeof req.body === 'string') {
    const privateKey = db.get('crypto.privateKey').value();
    try {
      req.body = await decryptString(privateKey, req.body);
    } catch (err) {
      console.log('decryption error');
      console.log(err);
    }
  }

  next();
});
