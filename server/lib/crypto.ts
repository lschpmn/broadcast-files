import { Response } from 'express';
import { sign } from 'jsonwebtoken';
import {  } from './db';

const SESSION_TIMEOUT = 60 * 5;

export const setJwtCookie = async (res: Response, payload): Promise<void> => {
  return new Promise((resolve, reject) => {
    sign(
      payload,
      'privateKey',
      { algorithm: 'RS256', expiresIn: SESSION_TIMEOUT },
      (err, jwt) => {
        if (err) {
          console.log('error');
          console.log(err);
          return reject(err);
        }

        console.log('setting jwt');
        res.cookie('auth', jwt, { maxAge: SESSION_TIMEOUT * 1000 });
        resolve();
      },
    );
  });
};
