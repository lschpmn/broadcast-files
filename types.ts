
export type DirectoryRoute = {
  // can user access directories and download files, true for all access
  canDownload: boolean | string[],
  // can user convert video file to chromecast compatible stream, true for all access
  canStream: boolean | string[],
  filePath: string,
  label: string,
  urlPath: string,
};

export type DbSchema = {
  crypto: {
    publicKey: string,
    privateKey: string,
  },
  imageCache: {
    [id: string]: string[],
  },
  users: {
    [username: string]: User,
  },
};

export type JWT = User & {
  exp: number,
  iat: number,
  password: undefined,
};

export type User = {
  username: string,
  password?: string,
  permissions: string[],
};
