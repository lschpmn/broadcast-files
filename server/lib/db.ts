import lowdb from 'lowdb';
import { LowdbAsync } from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';
import { join } from 'path';
import { DbSchema, User } from '../../types';

const DB_PATH = join(__dirname, '../..', 'db.json');

let db: LowdbAsync<DbSchema>;

export async function initDB() {
  const adapter = new FileAsync(DB_PATH);
  db = await lowdb(adapter);

  await db
    .defaults({
      crypto: {},
      imageCache: {},
      users: {},
    })
    .write();
}

// Crypto

export function getPrivateKey(): string {
  return db.get('crypto.privateKey').value();
}

export function getPublicKey(): string {
  return db.get('crypto.publicKey').value();
}

export async function setPublicPrivateKey(publicKey: string, privateKey: string) {
  await db.set(
    'crypto',
    { publicKey, privateKey },
  ).write();
}

// Image Cache

export function getImageCachePath(filePath: string): string {
  return db.get(['imageCache', filePath]).value();
}

export async function setImageCachePath(filePath: string, imagePath: string) {
  await db.set(['imageCache', filePath], imagePath).write();
}

// Users

export function getUser(username: string): User {
  return db.get(['users', username]).value();
}

export function getUsers() {
  return db.get('users').value();
}

export async function setUser(user: User) {
  await db.set(['users', user.username], user).write();
}

export async function setUsers(users: { [username: string]: User }) {
  await db.set('users', users).write();
}
