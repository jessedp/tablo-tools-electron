import { StdObj } from './app';
import Airing from '../utils/Airing';

export type ActionListType = {
  readonly airings: Array<Airing>;
};
export type ExportRecordType = {
  airing: StdObj;
  state: number;
  progress: Record<string, any>;
  startTime: Date | number;
  endTime: Date | number;
  ffmpegLog: Array<string>;
  isBulk: boolean;
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
