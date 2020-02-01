
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

export type User = {
  username: string,
  password?: string,
  permissions: string[],
};
