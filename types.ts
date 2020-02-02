
export type DirectoryRoute = {
  filePath: string,
  label: string,
  urlPath: string,
};

export type DbSchema = {
  crypto: {
    publicKey: string,
    privateKey: string,
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
