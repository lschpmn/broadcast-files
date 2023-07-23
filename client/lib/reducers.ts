import { createSlice } from '@reduxjs/toolkit';


const configSlice = createSlice({
  name: 'config',
  initialState: {},
  reducers: {
    set: (state, { payload }: { type: string, payload: object }) => {
      return payload;
    },
  },
});

export const configReducer = configSlice.reducer;
export const { set } = configSlice.actions;
