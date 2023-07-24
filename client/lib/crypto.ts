

export const arrayBufferToString = (ab: ArrayBuffer): string => {
  const array8Bit = new Uint8Array(ab);
  let str = '';
  for (let x = 0;x < array8Bit.length;x++) {
    str += String.fromCharCode(array8Bit[x]);
  }
  return str;
};
