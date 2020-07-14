import { ExportRecordType } from '../reducers/types';
import Airing from './Airing';
import { EXP_WAITING, ExportLogRecordType } from '../constants/app';
import getConfig from './config';

export function ExportRecord(airing: Airing) {
  const record: ExportRecordType = {
    airing,
    progress: {},
    state: EXP_WAITING,
    ffmpegLog: []
  };
  return record;
}

export function ExportLogRecord(airing: Airing) {
  const { device } = global.Api;
  const record: ExportLogRecordType = {
    server_id: device.serverid,
    object_id: airing.id,
    startTime: new Date().toLocaleString(),
    endTime: new Date().toLocaleString(),
    status: EXP_WAITING,
    atOnce: 1,
    origPath: airing.exportFile,
    realPath: airing.dedupedExportFile(),
    deleteOnFinish: false,
    dupeAction: getConfig().actionOnDuplicate,

    result: '',
    ffmpegLog: [],
    airingData: airing.data
  };
  return record;
}

export function LeaveMeALone() {}
