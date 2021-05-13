import ServerInfo, { Model } from 'tablo-api/dist/ServerInfo';
import { ExportRecordType } from '../reducers/types';
import Airing from './Airing';
import {
  EXP_WAITING,
  ExportLogRecordType,
  NamingTemplateType,
} from '../constants/app';
import getConfig from './config';
import { TemplateVarsType } from './namingTpl';

export function ExportRecord(airing: Airing) {
  const record: ExportRecordType = {
    airing,
    progress: {},
    state: EXP_WAITING,
    startTime: new Date(),
    endTime: new Date(),
    ffmpegLog: [],
  };
  return record;
}
export function ExportLogRecord(airing: Airing) {
  const { device } = global.Api;
  const isWeb = process && process.type && process.type === 'renderer';
  const record: ExportLogRecordType = {
    server_id: device.serverid,
    via: isWeb ? 'web' : 'cli',
    object_id: airing.id,
    startTime: new Date(),
    endTime: new Date(),
    status: EXP_WAITING,
    atOnce: 1,
    origPath: airing.exportFile,
    realPath: airing.dedupedExportFile(),
    deleteOnFinish: false,
    dupeAction: getConfig().actionOnDuplicate,
    result: '',
    ffmpegLog: [],
    airingData: airing.data,
  };
  return record;
}
export function EmptyServerInfoModel() {
  const model: Model = {
    wifi: false,
    tuners: 0,
    type: '',
    name: '',
    device: '',
  };
  return model;
}
export function EmptyServerInfo() {
  const info: ServerInfo = {
    server_id: '',
    name: '',
    timezone: '',
    version: '',
    local_address: '',
    setup_completed: false,
    build_number: 0,
    model: EmptyServerInfoModel(),
    availability: '',
    cache_key: '',
    checked: '',
  };

  return info;
}

export function EmptyNamingTemplate() {
  const ntt: NamingTemplateType = {
    label: '',
    slug: '',
    template: '',
    type: '',
  };
  return ntt;
}

export function EmptyTemplateVars() {
  const tv: TemplateVarsType = {
    full: {},
    shortcuts: {},
  };
  return tv;
}
