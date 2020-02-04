import * as bcrypt from 'bcrypt';
import { generateKeyPair as generateKeyPairCallback, privateDecrypt } from 'crypto';
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
  // cleanup
  const dbUsers = db.get('users').value();
  Object
    .keys(dbUsers)
    .filter(username => users.every(u => u.username !== username))
    .map(username => delete dbUsers[username]);

  // init
  users.forEach(user => {
    const dbUser = dbUsers[user.username];

    if (!dbUser) {
      console.log(`Adding user ${user.username}`);
      dbUsers[user.username] = user;
    } else if (!isEqual(dbUser.permissions, user.permissions)) {
      dbUser.permissions = user.permissions;
    }
  });
  await db.write();

  // user login
  app.post('/api/users/login', async (req, res) => {
    if (req.body.encrypted) {
      try {
        const decrypted = await decryptString(req.body.encrypted);
        const { username, password } = JSON.parse(decrypted);
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
        return;
      } catch (err) {
        console.log('decrypt error');
        console.error(err);
      }
    }

    res.status(403).end();
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

export const bufferToString = (ab: Buffer): string => {
  const array8Bit = new Uint8Array(ab);
  let str = '';
  for (let x = 0; x < array8Bit.length; x++) {
    str += String.fromCharCode(array8Bit[x]);
  }
  return str;
};

export const decryptString = async (encrypted: string) => {
  const buffer = stringToArrayBuffer(encrypted);
  const privateKey = db.get('crypto.privateKey').value();
  const decrypt = await privateDecrypt(
    {
      key: privateKey,
      oaepHash: 'SHA256',
    },
    new Uint8Array(buffer),
  );

  return bufferToString(decrypt);
};

export const initCrypto = async () => {
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
          type: 'pkcs1',
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

export const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};
