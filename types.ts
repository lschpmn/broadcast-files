


export type Action<T> = {
  payload: T,
  type: string,
};

export type DbSchema = {
  fileDetails: {
    [path: string]: NodeDetail,
  },
  routes: Route[],
  users: {
    [username: string]: User,
  },
};

export type EmitAction = (action: Action<any>, reason?: string) => void

export type NodeDetail = {
  name: string,
  size?: number,
  type: 'dir' | 'file',
  videoDetail?: {
    duration: number,
    height: number,
    width: number,
  },
};

export type Route = {
  canDownload: string[],
  canStream: string[],
  filePath: string,
  label: string,
  url: string, //should be longer than 3 characters
};

export type SocketFunctions = {
  [actionType: string]: (emit: EmitAction) => (p?: any) => void
};

export type User = {
  username: string,
  password?: string,
  roles: string[],
};
