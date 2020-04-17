import { generateKeyPair as generateKeyPairCallback, privateDecrypt, publicEncrypt, constants } from 'crypto';
import { LowdbAsync } from 'lowdb';
import { promisify } from 'util';
import { DbSchema } from '../../types';

const generateKeyPair = promisify(generateKeyPairCallback);

export const bufferToString = (ab: Buffer): string => {
  const array8Bit = new Uint8Array(ab);
  let str = '';
  for (let x = 0; x < array8Bit.length; x++) {
    str += String.fromCharCode(array8Bit[x]);
  }
  return str;
};

export const getPublicKeyFromHeader = (req: Request) => '-----BEGIN PUBLIC KEY-----\n'  +
  req.headers['key'] +
  '\n-----END PUBLIC KEY-----';

export const encryptString = async (publicKey: string, data: string) => {
  const buffer = stringToArrayBuffer(data);
  const encryptedBuffer = publicEncrypt(
    {
      key: publicKey,
      oaepHash: 'SHA256',
    },
    new Uint8Array(buffer),
  )

  return bufferToString(encryptedBuffer);
};

export const decryptString = async (privateKey: string, encrypted: string) => {
  const buffer = stringToArrayBuffer(encrypted);
  const decrypt = await privateDecrypt(
    {
      key: privateKey,
      oaepHash: 'SHA256',
    },
    new Uint8Array(buffer),
  );

  return bufferToString(decrypt);
};

export const initCrypto = async (db: LowdbAsync<DbSchema>) => {
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

const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};
