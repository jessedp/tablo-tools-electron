import { createSlice, PayloadAction, current } from '@reduxjs/toolkit';
// import { current } from 'immer';
import { ExportRecordType, StdObj } from '../constants/types';

export type ExportListState = {
  records: StdObj[];
};

const slice = createSlice({
  name: 'exportList',

  initialState: {
    records: [],
  } as ExportListState,

  reducers: {
    addExportRecord: (state, action: PayloadAction<ExportRecordType>) => {
      const exportRecord = action.payload;

      if (exportRecord.airing.video_details?.state === 'recording') {
        console.log('addExport - skipping recording in progress', exportRecord);
        return;
      }

      if (
        !state.records.find(
          (rec) => rec.airing.object_id === exportRecord.airing.object_id
        )
      ) {
        state.records = [...state.records, exportRecord];
      }
    },

    remExportRecord: (state, action: PayloadAction<ExportRecordType>) => {
      const exportRecord = action.payload;
      state.records = [...state.records].filter(
        (rec) => rec.airing.object_id !== exportRecord.airing.object_id
      );
    },

    bulkRemExportRecord: (state) => {
      state.records = [];
    },

    updateExportRecord: (state, action: PayloadAction<ExportRecordType>) => {
      current(state);

      const exportRecord = action.payload;
      state.records = [...state.records].filter(
        (rec) => rec.airing.object_id !== exportRecord.airing.object_id
      );
      state.records = [...state.records, exportRecord];
    },
  },
});

export const {
  addExportRecord,
  remExportRecord,
  bulkRemExportRecord,
  updateExportRecord,
} = slice.actions;

export default slice.reducer;
