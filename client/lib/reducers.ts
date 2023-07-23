import { createSlice } from '@reduxjs/toolkit';


const configSlice = createSlice({
  name: 'config',
  initialState: {},
  reducers: {
    set: (state, { payload }) => {
      return payload;
    },
  },
});

export const configReducer = configSlice.reducer;
export const { set } = configSlice.actions;
