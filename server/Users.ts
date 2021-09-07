import * as bcrypt from 'bcrypt';
import { Router } from 'express';
import { decode, verify } from 'jsonwebtoken';
// @ts-ignore
import * as isEqual from 'lodash/isEqual';
import { users } from '../config.json';
import { JWT } from '../types';
import { setJwtCookie } from './lib/crypto';
import { getPublicKey, getUser, getUsers, setUser, setUsers } from './lib/db';

export const UsersRouter = Router();

UsersRouter.use((req, res, next) => {
  if (!req.cookies.auth) return next();
  const publicKey = getPublicKey();

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
      res.locals.user = getUser(decoded.username);
      next();
    },
  );
});

UsersRouter.post('/users/login', async (req, res) => {
  try {
    const { username, password } = JSON.parse(req.body);
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
      await setUser(user);
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
});

export const setupUsers = async () => {
  // cleanup
  const dbUsers = getUsers();
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
  await setUsers(dbUsers);
};
