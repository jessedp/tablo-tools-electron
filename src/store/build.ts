import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  STATE_WAITING,
  STATE_START,
  STATE_LOADING,
  STATE_FINISH,
  STATE_ERROR,
} from '../constants/app';

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
    startBuild: (state, action: PayloadAction<null>) => {
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
    // setResults: (
    //   state: SearchSliceState,
    //   action: PayloadAction<SearchSliceStateUpdate>
    // ) => {
    //   state.results = action.payload.results;
    //   state.loading = action.payload.loading;
    //   state.searchAlert = action.payload.searchAlert;
    // },
  },
});

export const { startBuild, updateProgress } = slice.actions;

export default slice.reducer;
