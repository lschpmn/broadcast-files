import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { sign } from 'jsonwebtoken';
import { users } from '../config';
import { app, db } from './index';

const SECRET = Math.random().toString(36).slice(-10);

export const setupUsers =  async () => {
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
};

const getUser = (username: string) => db
  .get('users')
  .find({ username })
  .value();

const setJwtCookie = (res: Response, payload) => {
  return new Promise((resolve, reject) => {
    sign(payload, SECRET, (err, jwt) => {
      if (err) {
        console.log('error');
        console.log(err);
        return reject(err);
      }

      console.log('setting jwt');
      res.cookie('auth', jwt);
      resolve();
    });
  });
};
