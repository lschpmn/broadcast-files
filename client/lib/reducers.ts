import { createSlice } from '@reduxjs/toolkit';
import { Action, NodeDetail } from '../../types';
import { ConfigState, DirectoryListState } from '../types';

const configSlice = createSlice({
  name: 'config',
  initialState: {} as ConfigState,
  reducers: {
    setConfig: (state, { payload }: Action<ConfigState>) => {
      return payload;
    },
  },
});

const directoryListSlice = createSlice({
  name: 'directoryList',
  initialState: {
    loading: false,
    list: [],
  } as DirectoryListState,
  reducers: {
    getDirectoryListSendServer: (state, action: Action<string>) => {
      state.list = [];
      state.loading = true;
    },
    setDirectoryList: (state, { payload }: Action<NodeDetail[]>) => {
      state.list = payload;
      state.loading = false;
    },
    getFileDetailsSendServer: (state, action: Action<string>) => {
      state.loading = true;
    },
    setFileDetails: (state, { payload }: Action<NodeDetail>) => {
      state.loading = false;
      const i = state.list.findIndex(n => n.name === payload.name);
      if (i >= 0) state.list[i] = payload;
      else state.list.push(payload);
    },
  },
});

export const configReducer = configSlice.reducer;
export const { setConfig } = configSlice.actions;
export const directoryListReducer = directoryListSlice.reducer;
export const { getDirectoryListSendServer, setDirectoryList, getFileDetailsSendServer, setFileDetails } = directoryListSlice.actions;
