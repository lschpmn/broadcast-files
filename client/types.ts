import { NodeDetail } from '../types';

export type State = {
  config: ConfigState,
  nodeShrub: NodeShrub,
};

export type ConfigState = {
  routes: {
    label: string,
    url: string,
  }[],
};

export type NodeShrub = {
  [path: string]: NodeDetail,
};
