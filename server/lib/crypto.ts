import { LowdbAsync } from 'lowdb';
import * as forge from 'node-forge';
import { DbSchema } from '../../types';

export const parseEncryptedCipher = (headers): string => headers['x-crypto-key'];

export const parseIV = (headers): string => headers['x-crypto-iv'];

export const atob = (str: string) => Buffer.from(str, 'base64').toString('binary');

export const btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');

export const encryptString = (cipherKey: string, iv: string, data: string): string => {
  const cipher = forge.cipher.createCipher('AES-GCM', cipherKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(data));
  cipher.finish();

  return cipher.output.data + cipher.mode.tag.data;
};

export const decryptCipherString = (cipherKey: string, iv: string, data: string) => {
  const decipher = forge.cipher.createDecipher('AES-GCM', cipherKey);
  decipher.start({ iv, tag: forge.util.createBuffer(data.slice(-16)) });
  decipher.update(forge.util.createBuffer(data.slice(0, -16)));
  decipher.finish();

  return decipher.output.data;
};

export const decryptString = (privateKey: string, encrypted: string): string => {
  const privateKeyForge: forge.pki.rsa.PrivateKey = forge.pki.privateKeyFromPem(privateKey) as any;
  return privateKeyForge.decrypt(encrypted);
};

export const initCrypto = async (db: LowdbAsync<DbSchema>) => {
  const crypto = db.get('crypto').value();

  if (!crypto.publicKey || !crypto.privateKey) {
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
    const publicPrivateKey = {
      publicKey: forge.pki.publicKeyToPem(keyPair.publicKey),
      privateKey: forge.pki.privateKeyToPem(keyPair.privateKey),
    };

    await db.set('crypto', publicPrivateKey).write();
    console.log('Successfully generated public/private RSA key');
  }
};

export const generateIV = () => forge.random.getBytes(12);
