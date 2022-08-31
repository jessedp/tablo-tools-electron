import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StdObj } from '../constants/app';
import Show from '../utils/Show';

export type ActionListState = {
  records: StdObj[];
};

const slice = createSlice({
  name: 'actionList',

  initialState: {
    records: [],
  } as ActionListState,

  reducers: {
    addAiring: (state, action: PayloadAction<StdObj>) => {
      const airing = action.payload;
      if (!state.records.find((rec) => rec.object_id === airing.object_id)) {
        state.records = [...state.records, airing];
      }
    },
    remAiring: (state, action: PayloadAction<StdObj>) => {
      const airing = action.payload;
      state.records = [...state.records].filter(
        (rec) => rec.object_id !== airing.object_id
      );
    },
    bulkAddAirings: (state, action: PayloadAction<StdObj[]>) => {
      const airings = action.payload;
      airings.forEach((item) => {
        if (!state.records.find((rec) => rec.object_id === item.object_id)) {
          state.records.push(item);
        }
      });
    },
    bulkRemAirings: (state, action: PayloadAction<StdObj[]>) => {
      const airings = action.payload;
      if (!airings || airings.length === 0) {
        state.records = [];
      } else {
        state.records = [...state.records].filter(
          (rec) => !airings.find((item) => rec.object_id === item.object_id)
        );
      }
    },
    addShow: (_, action: PayloadAction<Show | StdObj>) => {
      const show = action.payload;
      console.log('addShow!!!', show);
    },
    remShow: (_, action: PayloadAction<Show | StdObj>) => {
      const show = action.payload;
      console.log('remShow!!!', show);
    },
  },
});

export const {
  addAiring,
  remAiring,
  bulkAddAirings,
  bulkRemAirings,
  addShow,
  remShow,
} = slice.actions;

export default slice.reducer;
