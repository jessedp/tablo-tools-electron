import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    sendFlash: (_, action: PayloadAction<any>) => {
      return action.payload;
    },
  },
});

export const { sendFlash } = slice.actions;

export default slice.reducer;
