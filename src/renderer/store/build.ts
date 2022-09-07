import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { STATE_START, STATE_LOADING } from '../constants/app';

export type DbSliceState = {
  loading?: number;
  log?: Array<string>;
  airingInc?: number;
  airingMax?: number;
  recCount?: number;
};

const slice = createSlice({
  name: 'build',

  initialState: {
    loading: 0,
    log: [],
    airingInc: 0,
    airingMax: 1,
    recCount: 0,
  } as DbSliceState,

  reducers: {
    startBuild: (state) => {
      if (state.loading !== STATE_LOADING) state.loading = STATE_START;
    },
    updateProgress: (state, action: PayloadAction<DbSliceState>) => {
      const { payload } = action;
      if (payload.loading !== undefined) state.loading = payload.loading;
      if (payload.log !== undefined) state.log = payload.log;
      if (payload.airingInc !== undefined) state.airingInc = payload.airingInc;
      if (payload.airingMax !== undefined) state.airingMax = payload.airingMax;
      if (payload.recCount !== undefined) state.recCount = payload.recCount;
    },
  },
});

export const { startBuild, updateProgress } = slice.actions;

export default slice.reducer;
