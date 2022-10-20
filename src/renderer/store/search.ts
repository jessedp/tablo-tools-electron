import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ViewType, VIEW_GRID } from '../constants/app';
import { SearchAlert } from '../constants/types';
import { EmptySearchAlert } from '../utils/factories';

export type SearchSliceState = {
  loading: boolean;
  view?: ViewType;
  results: Array<Record<string, any>>;
  searchAlert: SearchAlert;
};

const slice = createSlice({
  name: 'search',

  initialState: {
    loading: true,
    view: VIEW_GRID,
    results: [],
    searchAlert: EmptySearchAlert(),
  } as SearchSliceState,

  reducers: {
    setLoading: (state: SearchSliceState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setView: (state: SearchSliceState, action: PayloadAction<ViewType>) => {
      state.view = action.payload;
    },
    setAlert: (state: SearchSliceState, action: PayloadAction<SearchAlert>) => {
      state.searchAlert = action.payload;
    },
    setResults: (
      state: SearchSliceState,
      action: PayloadAction<SearchSliceState>
    ) => {
      state.results = action.payload.results;
      state.loading = action.payload.loading;
      state.searchAlert = action.payload.searchAlert;
    },
  },
});

export const { setLoading, setView, setAlert, setResults } = slice.actions;

export default slice.reducer;
