


export type Action<T> = {
  payload: T,
  type: string,
};

export type DirectoryRoute = {
  // can user access directories and download files, true for all access
  canDownload: boolean | string[],
  // can user convert video file to chromecast compatible stream, true for all access
  canStream: boolean | string[],
  filePath: string,
  label: string,
  url: string,
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

export type JWT = User & {
  exp: number,
  iat: number,
  password: any,
};

export type Route = {
  canDownload: boolean,
  canStream: boolean,
  filePath: string,
  label: string,
  url: string,
};

export type SocketFunction = {
  [actionType: string]: (emit: EmitAction) => (p?: any) => void
};

export type User = {
  username: string,
  password?: string,
  permissions: string[],
};
