import type { Dispatch as ReduxDispatch, Store as ReduxStore } from 'redux';
import Airing from '../utils/Airing';

export type counterStateType = {
  readonly counter: number;
};
export type actionListType = {
  readonly airings: Array<Airing>;
};
export type ExportRecordType = {
  airing: Airing;
  state: number;
  progress: Record<string, any>;
  startTime: Date;
  endTime: Date;
  ffmpegLog: Array<string>;
};
export type FlashRecordType = {
  message: string;
  type?: string;
};
export type ExportListStateType = {
  exportList: Array<ExportRecordType>;
  airing?: Airing;
  airings: Array<Airing>;
  updateAiring?: Airing;
};

export type Action = {
  readonly type: string;
  view: string;
  results: Array<Airing>;
  message: string;

  exportRecord: ExportRecordType;
  airing: Airing;
  airings: Array<Airing>;
};

// export type GetExportList = () => exportListType;
export type GetActionList = () => actionListType;
export type GetState = () => counterStateType;
export type Dispatch = ReduxDispatch<Action>;
export type Store = ReduxStore<GetState, Action>;
