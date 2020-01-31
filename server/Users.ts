import { Express } from 'express';
import { LowdbAsync } from 'lowdb';
import { users } from '../config';
import { DbSchema } from '../types';

export const initUsers =  async (app: Express, db: LowdbAsync<DbSchema>) => {
  // cleanup
  await db
    .get('users')
    .remove(user => !users.some(u => u.username === user.username))
    .write();

  // init
  await users.map(async user => {
    const userExists = !!db
      .get('users')
      // @ts-ignore
      .find({ username: user.username })
      .value();

    if (!userExists) {
      console.log(`Adding user ${user.username}`);
      await db
        .get('users')
        // @ts-ignore
        .push(user)
        .write();
    }
  });
};
