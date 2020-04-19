import { createCipheriv, generateKeyPair as generateKeyPairCallback, privateDecrypt } from 'crypto';
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

export const parseHeaders = (headers) => ({
  encryptedCipher: headers['x-crypto-key'],
  iv: headers['x-crypto-iv'],
});

export const encryptString = async (cipherKey: string, iv: string, data: string) => {
  const keyBuffer = Buffer.from(stringToArrayBuffer(atob(cipherKey)));
  const ivBuffer = Buffer.from(stringToArrayBuffer(atob(iv)));
  const cipher = createCipheriv('aes-256-gcm', keyBuffer, ivBuffer);

  return Buffer
    .concat([cipher.update(data, 'utf8'), cipher.final(), cipher.getAuthTag()])
    .toString('base64');
};

export const decryptString = async (privateKey: string, encrypted: string) => {
  const buffer = stringToArrayBuffer(atob(encrypted));
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

function atob(str) {
  return Buffer.from(str, 'base64').toString('binary');
}

function btoa(str) {
  return Buffer.from(str.toString(), 'binary').toString('base64');
}

