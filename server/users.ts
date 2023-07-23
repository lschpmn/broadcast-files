import bcrypt from 'bcrypt';
import { Router } from 'express';
import { decode, verify } from 'jsonwebtoken';
// @ts-ignore
import isEqual from 'lodash/isEqual';
import { users } from '../config.json';
import { JWT } from '../types';
import { setJwtCookie } from './lib/crypto';
import db from './lib/db';
import { log } from './lib/utils';

export const UsersRouter = Router();

UsersRouter.use((req, res, next) => {
  if (!req.cookies.auth) return next();

  verify(
    req.cookies.auth,
    'publicKey',
    { algorithms: ['RS256'] },
    (err, decoded: JWT) => {
      if (err) {
        const jwt: JWT = decode(req.cookies.auth) as any;
        log(`failed to verify user ${jwt.username}`);
        log(JSON.stringify(err));
        return next();
      }

      log(`verified user ${decoded.username}`);
      res.locals.user = db.getUser(decoded.username);
      next();
    },
  );
});

UsersRouter.post('/users/login', async (req, res) => {
  try {
    const { username, password } = JSON.parse(req.body);
    const user = db.getUser(username);

    if (!user) {
      log(`user ${username} not found`);
      res.status(403).end();
      return;
    }

    if (user.password && !(await bcrypt.compare(password, user.password))) {
      log(`Unauthorized login attempt by user ${username}`);
      return res.status(403).end();
    }

    if (!user.password) {
      log('First login, generating hashed and salted password');
      user.password = await bcrypt.hash(password, 10);
      db.setUser(user);
    }

    log(`Successful login by user ${username}`);
    await setJwtCookie(res, {
      username: user.username,
      permissions: user.permissions,
    });
    res.send();
    return;
  } catch (err) {
    log('decrypt error');
    console.error(err);
  }
});

export const setupUsers = () => {
  // cleanup
  const dbUsers = db.getUsers();
  Object
    .keys(dbUsers)
    .filter(username => users.every(u => u.username !== username))
    .map(username => delete dbUsers[username]);

  // init
  users.forEach(user => {
    const dbUser = dbUsers[user.username];

    if (!dbUser) {
      log(`Adding user ${user.username}`);
      dbUsers[user.username] = user;
    } else if (!isEqual(dbUser.permissions, user.permissions)) {
      dbUser.permissions = user.permissions;
    }
  });
  db.setUsers(dbUsers);
};
