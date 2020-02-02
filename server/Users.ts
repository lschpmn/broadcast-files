import * as bcrypt from 'bcrypt';
import { generateKeyPair as generateKeyPairCallback } from 'crypto';
import { Response } from 'express';
import { decode, sign, verify } from 'jsonwebtoken';
// @ts-ignore
import * as isEqual from 'lodash/isEqual';
import { promisify } from 'util';
import { users } from '../config';
import { JWT, User } from '../types';
import { app, db } from './index';

const SESSION_TIMEOUT = 60 * 5;
const generateKeyPair = promisify(generateKeyPairCallback);

export const setupUsers = async () => {
  await initCrypto();
  // cleanup
  const dbUsers = db.get('users').value();
  Object
    .keys(dbUsers)
    .filter(username => users.every(u => u.username !== username))
    .map(username => delete dbUsers[username]);
  await db.write();

  // init
  await users.map(async user => {
    const dbUser = db
      .get(`users.${user.username}`)
      .value();

    if (!dbUser) {
      console.log(`Adding user ${user.username}`);
      await db
        .set(`users.${user.username}`, user)
        .write();
    } else if (!isEqual(dbUser.permissions, user.permissions)) {
      dbUser.permissions = user.permissions;
      await db.write();
    }
  });

  // user login
  app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    const user: User = db
      .get(`users.${username}`)
      .value();

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

  // auth
  app.use((req, res, next) => {
    if (!req.cookies.auth) return next();
    const publicKey = db.get('crypto.publicKey').value();

    verify(
      req.cookies.auth,
      publicKey,
      { algorithms: ['RS256'] },
      (err, decoded: JWT) => {
        if (err) {
          const jwt: JWT = decode(req.cookies.auth) as any;
          console.log(`failed to verify user ${jwt.username}`);
          console.log(err);
          return next();
        }

        console.log(`verified user ${decoded.username}`);
        res.locals.user = decoded;
        next();
      },
    );
  });
};

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
