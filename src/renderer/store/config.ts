import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import getConfig from 'renderer/utils/config';

const initialState = getConfig();

const slice = createSlice({
  name: 'config',

  initialState,

  reducers: {
    setConfig: (_, action: PayloadAction<any>) => {
      return action.payload;
    },

    setConfigItem: (_, action: PayloadAction<any>) => {
      return { ...initialState, ...action.payload };
    },
  },
});

export const { setConfig, setConfigItem } = slice.actions;

export default slice.reducer;
