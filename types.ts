
export type DirectoryRoute = {
  filePath: string,
  label: string,
  urlPath: string,
};

export type DbSchema = {
  users: User[],
};

export type User = {
  username: string,
  password?: string,
  permissions: string[],
};
