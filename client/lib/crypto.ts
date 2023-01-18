

export const arrayBufferToString = (ab: ArrayBuffer): string => {
  const array8Bit = new Uint8Array(ab);
  let str = '';
  for (let x = 0;x < array8Bit.length;x++) {
    str += String.fromCharCode(array8Bit[x]);
  }
  return str;
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
