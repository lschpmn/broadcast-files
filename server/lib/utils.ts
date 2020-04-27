
export const promiseStreams = (promises: Promise<any>[], streams: number): () => void => {
  let cancel = false;

  return () => {
    cancel = true;
  };
};

export const wait = async (waitTime: number) => {
  return new Promise(res => {
    setTimeout(res, waitTime);
  });
};
