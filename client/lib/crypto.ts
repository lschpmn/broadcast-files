import * as forge  from 'node-forge';
// @ts-ignore
forge.options.usePureJavaScript = true;

const publicKeyStr = window.__PUBLIC_KEY__;
let publicServerKey: forge.pki.rsa.PublicKey;
let key: PromiseLike<string>;
let secureKey: Promise<string>;

export const arrayBufferToString = (ab: ArrayBuffer): string => {
  const array8Bit = new Uint8Array(ab);
  let str = '';
  for (let x = 0;x < array8Bit.length;x++) {
    str += String.fromCharCode(array8Bit[x]);
  }
  return str;
};

export const decryptString = async (iv: string, encrypted: string) => {
  const cipherKey = await getKey();
  const decipher = forge.cipher.createDecipher('AES-GCM', cipherKey);
  decipher.start({ iv, tag: forge.util.createBuffer(encrypted.slice(-16)) });
  decipher.update(forge.util.createBuffer(encrypted.slice(0, -16)));
  decipher.finish();
  return decipher.output.data;
};

export const encryptString = async (iv: string, str: string): Promise<string> => {
  const cipherKey = await getKey();
  const cipher = forge.cipher.createCipher('AES-GCM', cipherKey);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(str));
  cipher.finish();

  return cipher.output.data + cipher.mode.tag.data;
};

export const generateIV = (): Promise<string> => {
  return getRandomString(12);
};

export const getRandomString = async (bytes: number): Promise<string> => {
  return new Promise((res, rej) => {
    // @ts-ignore
    forge.random.getBytes(bytes, (err, bytes: string) => {
      if (err) rej(err);
      else res(bytes);
    });
  });
}

export const getSecureKey = async (): Promise<string> => {
  if (secureKey) return secureKey;
  return secureKey = new Promise(async (res, rej) => {
    try {
      const cipher = await getKey();
      res(encryptStringWithPublicKey(cipher));
    } catch (err) {
      console.log(err);
      rej(err);
    }
  });
};

const encryptStringWithPublicKey = (str: string): string => {
  const publicKey = getPublicServerKey();
  return publicKey.encrypt(str);
};

const getKey = async () => {
  if (key) return key;

  return key = getRandomString(16);
};

const getPublicServerKey = (): forge.pki.rsa.PublicKey => {
  if (publicServerKey) return publicServerKey;

  return publicServerKey = forge.pki.publicKeyFromPem(publicKeyStr) as any;
};
