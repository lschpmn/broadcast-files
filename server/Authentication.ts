import { Router } from 'express';
import { db } from './index';
import { decryptString } from './lib/crypto';

export const AuthenticationRouter = Router();

AuthenticationRouter.use(async (req, res, next) => {
  if (req.body) {
    const privateKey = db.get('crypto.privateKey').value();
    req.body = await decryptString(privateKey, req.body);
  }

  next();
});
