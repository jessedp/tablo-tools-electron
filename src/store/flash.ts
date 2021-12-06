import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StdObj } from '../constants/app';

export type FlashState = {
  message: string;
  type: string;
};

const slice = createSlice({
  name: 'flash',

  initialState: {
    message: '',
    type: 'success',
  } as FlashState,

  reducers: {
    sendFlash: (state, action: PayloadAction<any>) => {
      return action.payload;
    },
  },
});

export const { sendFlash } = slice.actions;

export default slice.reducer;
