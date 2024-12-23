import { createSlice } from '@reduxjs/toolkit';
import { Action } from '../../types';
import { ConfigState, NodeShrub } from '../types';

const configSlice = createSlice({
  name: 'config',
  initialState: {} as ConfigState,
  reducers: {
    setConfig: (state, { payload }: Action<ConfigState>) => {
      return payload;
    },
  },
});

const nodeShrubSlice = createSlice({
  name: 'nodeShrub',
  initialState: {} as NodeShrub,
  reducers: {
    inspectNodeSendServer: (state: NodeShrub, action: Action<string>) => {},
    setNode: (state: NodeShrub, action: Action<NodeShrub>) => {
      const nodeShrub = action.payload;
      for (let pathname in nodeShrub) {
        const node = nodeShrub[pathname];
        state[pathname] = { ...state[pathname], ...node };
      }
    },
  },
});

export const configReducer = configSlice.reducer;
export const { setConfig } = configSlice.actions;
export const nodeShrubReducer = nodeShrubSlice.reducer;
export const { inspectNodeSendServer, setNode } = nodeShrubSlice.actions;
