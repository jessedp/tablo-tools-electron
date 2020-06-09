import { ExportRecordType } from '../reducers/types';
import Airing from './Airing';
import { EXP_WAITING } from '../constants/app';

export function ExportRecord(airing: Airing) {
  const record: ExportRecordType = {
    airing,
    progress: {},
    state: EXP_WAITING,
    ffmpegLog: []
  };
  return record;
}

export function LeaveMeALone() {}
