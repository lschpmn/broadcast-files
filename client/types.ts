import { NodeDetail } from '../types';

export type State = {
  config: ConfigState,
  directoryList: DirectoryListState,
};

export type ConfigState = {
  routes: {
    label: string,
    url: string,
  }[],
};

export type DirectoryListState = {
  loading: boolean,
  list: NodeDetail[],
};
