import * as bcrypt from 'bcrypt';
import { generateKeyPair as generateKeyPairCallback } from 'crypto';
import { Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { promisify } from 'util';
import { users } from '../config';
import { User } from '../types';
import { app, db } from './index';

type JWT = User & {
  iat: string,
};

const generateKeyPair = promisify(generateKeyPairCallback);

export const setupUsers = async () => {
  await initCrypto();
  // cleanup
  await db
    .get('users')
    .remove(user => !users.some(u => u.username === user.username))
    .write();

  // init
  await users.map(async user => {
    const userExists = !!getUser(user.username);

    if (!userExists) {
      console.log(`Adding user ${user.username}`);
      await db
        .get('users')
        // @ts-ignore
        .push(user)
        .write();
    }
  });

  app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    const user = getUser(username);

    if (!user) {
      console.log(`user ${username} not found`);
      res.status(403).end();
      return;
    }

    if (user.password && !(await bcrypt.compare(password, user.password))) {
      console.log(`Unauthorized login attempt by user ${username}`);
      return res.status(403).end();
    }

    if (!user.password) {
      console.log('First login, generating hashed and salted password');
      user.password = await bcrypt.hash(password, 10);
      await db.write();
    }

    console.log(`Successful login by user ${username}`);
    await setJwtCookie(res, {
      username: user.username,
      permissions: user.permissions,
    });
    res.send();
  });

  app.use((req, res, next) => {
    if (!req.cookies.auth) return next();
    const publicKey = db.get('crypto.publicKey').value();

    verify(
      req.cookies.auth,
      publicKey,
      { algorithms: ['RS256'] },
      (err, decoded: JWT) => {
        if (err) {
          console.log(`failed to verify user ${decoded.username}`);
          console.log(err.message);
          console.log(err);
          next();
          return;
        }

        console.log(`verified user ${decoded.username}`);
        res.locals.user = decoded;
        next();
      },
    );
  });
};

const getUser = (username: string) => db
  .get('users')
  .find({ username })
  .value();

const initCrypto = async () => {
  const crypto = db.get('crypto').value();

  if (!crypto.publicKey) {
    const publicPrivateKey = await generateKeyPair(
      'rsa',
      {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      },
    );

    await db.set('crypto', publicPrivateKey).write();
    console.log('Successfully generated public/private RSA key');
  }
};

const setJwtCookie = async (res: Response, payload) => {
  const privateKey = db.get('crypto.privateKey').value();

  return new Promise((resolve, reject) => {
    sign(
      payload,
      privateKey,
      { algorithm: 'RS256' },
      (err, jwt) => {
        if (err) {
          console.log('error');
          console.log(err);
          return reject(err);
        }

        console.log('setting jwt');
        res.cookie('auth', jwt);
        resolve();
      },
    );
  });
};
