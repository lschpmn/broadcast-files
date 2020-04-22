import {
  createCipheriv,
  createDecipheriv,
  generateKeyPair as generateKeyPairCallback,
  privateDecrypt,
  randomBytes,
} from 'crypto';
import { LowdbAsync } from 'lowdb';
import { promisify } from 'util';
import { DbSchema } from '../../types';

const generateKeyPair = promisify(generateKeyPairCallback);

export const parseEncryptedCipher = (headers): string => headers['x-crypto-key'];

export const parseIV = (headers): string => headers['x-crypto-iv'];

export const encryptString = (cipherKey: string, iv: Buffer, data: string) => {
  const keyBuffer = Buffer.from(cipherKey, 'binary');
  const cipher = createCipheriv('aes-128-gcm', keyBuffer, iv);

  return Buffer
    .concat([cipher.update(data, 'binary'), cipher.final(), cipher.getAuthTag()])
    .toString('binary');
};

export const decryptCipherString = (cipherKey: string, iv: Buffer, data: string) => {
  const keyBuffer = Buffer.from(cipherKey, 'binary');
  const cipher = createDecipheriv('aes-128-gcm', keyBuffer, iv);
  const encrypted = data.slice(0, -16);
  cipher.setAuthTag(Buffer.from(data.slice(-16), 'binary'));
  const decrypted = cipher.update(encrypted, 'binary', 'binary');
  cipher.final();

  return decrypted;
};

export const decryptString = (privateKey: string, encrypted: string) => {
  const buffer = Buffer.from(encrypted, 'base64');
  const decrypt = privateDecrypt(
    {
      key: privateKey,
      oaepHash: 'SHA256',
    },
    new Uint8Array(buffer),
  );

  return decrypt.toString('binary');
};

export const initCrypto = async (db: LowdbAsync<DbSchema>) => {
  const crypto = db.get('crypto').value();

  if (!crypto.publicKey) {
    const publicPrivateKey = await generateKeyPair(
      'rsa',
      {
        modulusLength: 2048,
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

export const generateIV = () => randomBytes(12);
