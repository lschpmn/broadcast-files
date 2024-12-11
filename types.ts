


export type Action<T> = {
  payload: T,
  type: string,
};

export type DbSchema = {
  imageCache: {
    [id: string]: string,
  },
  routes: Route[],
  users: {
    [username: string]: User,
  },
};

export type EmitAction = (action: Action<any>, reason?: string) => void

export type Route = {
  canDownload: string[],
  canStream: string[],
  filePath: string,
  label: string,
  url: string, //should be longer than 3 characters
};

export type SocketFunction = {
  [actionType: string]: (emit: EmitAction) => (p?: any) => void
};

export type User = {
  username: string,
  password?: string,
  roles: string[],
};
