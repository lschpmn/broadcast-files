import { InspectResult } from 'fs-jetpack/types';

export type Message = {
  image?: string
  name: string,
  status?: 'loading' | 'loaded' | 'error',
};

export type State = {
  config: {
    routes: [{
      label: string,
      url: string,
    }],
  },
  directoryList: {
    loading: boolean,
    list: InspectResult[],
  },
};

declare global {
  interface Window {
    __DOMAIN__: string,
    __PUBLIC_KEY__: string,
  }
}
