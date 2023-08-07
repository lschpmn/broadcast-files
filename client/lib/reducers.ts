import { createSlice } from '@reduxjs/toolkit';
import { Action } from '../../types';

const configSlice = createSlice({
  name: 'config',
  initialState: {},
  reducers: {
    getConfigSendServer: () => {},
    setConfig: (state, { payload }: Action<object>) => {
      return payload;
    },
  },
});

const directoryListSlice = createSlice({
  name: 'directoryList',
  initialState: {
    loading: false,
    list: [],
  },
  reducers: {
    getDirectoryListSendServer: (state, action: Action<string>) => {
      state.list = [];
      state.loading = true;
    },
    setDirectoryList: (state, { payload }: Action<object[]>) => {
      state.list = payload;
      state.loading = false;
    },
  },
});

export const configReducer = configSlice.reducer;
export const { getConfigSendServer, setConfig } = configSlice.actions;
export const directoryListReducer = directoryListSlice.reducer;
export const { getDirectoryListSendServer, setDirectoryList } = directoryListSlice.actions;
