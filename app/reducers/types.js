import type { Dispatch as ReduxDispatch, Store as ReduxStore } from 'redux';

import Airing from '../utils/Airing';

export type counterStateType = {
  +counter: number
};

export type actionListType = {
  +airings: Array<Airing>
};

export type ExportRecordType = {
  airing: Airing,
  state: number,
  progress: Object
};

export type FlashRecordType = {
  message: string,
  type?: string
};

export type ExportListStateType = {
  exportList: Array<ExportRecordType>,
  airing: Airing,
  airings: Array<Airing>,
  updateAiring: Airing
};

export type Action = {
  +type: string
};

export type GetExportList = () => exportListType;
export type GetActionList = () => actionListType;

export type GetState = () => counterStateType;

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<GetState, Action>;
