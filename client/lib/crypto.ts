
const publicKeyStr = window.__PUBLIC_KEY__
  .replace('-----BEGIN PUBLIC KEY-----\n', '')
  .replace('-----END PUBLIC KEY-----\n', '');
let publicServerKey: CryptoKey;
let key: CryptoKey;

export const arrayBufferToString = (ab: ArrayBuffer): string => {
  const array8Bit = new Uint8Array(ab);
  let str = '';
  for (let x = 0;x < array8Bit.length;x++) {
    str += String.fromCharCode(array8Bit[x]);
  }
  return str;
};

export const decryptString = async (iv: ArrayBuffer, encrypted: string) => {
  const cipherKey = await getKey();
  const buffer = stringToArrayBuffer(encrypted);
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    cipherKey,
    buffer
  )

  return arrayBufferToString(decryptedBuffer);
};

export const encryptString = async (iv: Uint8Array, str: string): Promise<string> => {
  const cipherKey = await getKey();
  const arrayBuffer = stringToArrayBuffer(str);
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    cipherKey,
    arrayBuffer,
  );

  return arrayBufferToString(encryptedBuffer);
};

export const generateIV = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(12));
};

export const getSecureKey = async (): Promise<string> => {
  const cipherKey = await getKey();
  const extractedKey = await crypto.subtle.exportKey('raw', cipherKey);
  const cipher = btoa(arrayBufferToString(extractedKey));

  return encryptStringWithPublicKey(cipher);
};

const encryptStringWithPublicKey = async (str: string): Promise<string> => {
  const publicKey = await getPublicServerKey();
  const arrayBuffer = stringToArrayBuffer(str);
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    arrayBuffer,
  );

  return btoa(arrayBufferToString(encryptedBuffer));
};

const getKey = async () => {
  if (key) return key;

  return key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
};

const getPublicServerKey = async (): Promise<CryptoKey> => {
  if (publicServerKey) return publicServerKey;

  return publicServerKey = await crypto.subtle.importKey(
    'spki',
    stringToArrayBuffer(atob(publicKeyStr)),
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
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
