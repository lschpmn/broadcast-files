
const publicKeyStr = window.__PUBLIC_KEY__
  .replace('-----BEGIN PUBLIC KEY-----\n', '')
  .replace('-----END PUBLIC KEY-----\n', '');
let publicPrivateKeyPair: CryptoKeyPair;
let publicServerKey: CryptoKey;

export const decryptString = async (encrypted: string) => {
  const keyPair = await getPublicPrivateKey();
  const buffer = stringToArrayBuffer(encrypted);
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    keyPair.privateKey,
    buffer
  )

  return arrayBufferToString(decryptedBuffer);
};

export const encryptStringg = async (str: string) => {
  const publicKey = await getPublicPrivateKey();
  const arrayBuffer = stringToArrayBuffer(str);
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey.publicKey,
    arrayBuffer,
  );

  return arrayBufferToString(encryptedBuffer);
};

export const encryptString = async (str: string) => {
  const publicKey = await getPublicServerKey();
  const arrayBuffer = stringToArrayBuffer(str);
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    arrayBuffer,
  );

  return arrayBufferToString(encryptedBuffer);
};

export const getPublicKey = async (): Promise<string> => {
  const keyPair = await getPublicPrivateKey();
  const keyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  return btoa(arrayBufferToString(keyBuffer));
};

const arrayBufferToString = (ab: ArrayBuffer): string => {
  const array8Bit = new Uint8Array(ab);
  let str = '';
  for (let x = 0;x < array8Bit.length;x++) {
    str += String.fromCharCode(array8Bit[x]);
  }
  return str;
};

const getPublicPrivateKey = async (): Promise<CryptoKeyPair> => {
  if (publicPrivateKeyPair) return publicPrivateKeyPair

  return publicPrivateKeyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    } as RsaHashedKeyGenParams,
    true,
    ['encrypt', 'decrypt']
  );
};

const getPublicServerKey = async (): Promise<CryptoKey> => {
  if (publicServerKey) return publicServerKey;

  return publicServerKey = await crypto.subtle.importKey(
    'spki',
    stringToArrayBuffer(atob(publicKeyStr)), //key
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    } as any,
    false,
    ['encrypt'],
  );
};

const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};
