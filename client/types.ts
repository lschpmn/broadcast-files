import { InspectResult } from 'fs-jetpack/types';

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
