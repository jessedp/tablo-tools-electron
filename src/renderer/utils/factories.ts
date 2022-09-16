import ServerInfo, { Model } from 'tablo-api/dist/src/ServerInfo';
import { ExportRecordType } from '../constants/types';
import Airing from './Airing';
import {
  EXP_WAITING,
  ExportLogRecordType,
  NamingTemplateType,
  ShowStatRowType,
  StdObj,
} from '../constants/app';
// import getConfig from './config';
import { TemplateVarsType } from './namingTpl';
import { SearchAlert } from './types';

export function ExportRecord(airing: StdObj) {
  const record: ExportRecordType = {
    airing,
    progress: {},
    state: EXP_WAITING,
    startTime: new Date().getMilliseconds(),
    endTime: new Date().getMilliseconds(),
    ffmpegLog: [],
  };
  // console.log('ExportRecord record', airing.data);
  return record;
}
export function ExportLogRecord(airing: Airing) {
  // const { device } = window.Tablo.device().serverid;
  const isWeb = !(typeof window === 'undefined');
  const record: ExportLogRecordType = {
    server_id: window.Tablo.device().server_id,
    via: isWeb ? 'web' : 'cli',
    object_id: airing.id,
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    status: EXP_WAITING,
    atOnce: 1,
    origPath: airing.exportFile,
    realPath: airing.cachedDedupedExportFile,
    deleteOnFinish: false,
    dupeAction: window.ipcRenderer.sendSync('get-config').actionOnDuplicate,
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

export function EmptyShowStatRow() {
  const ssr: ShowStatRowType = {
    count: '0',
    cover: 0,
    duration: 0,
    first: new Date(),
    last: new Date(0),
    object_id: 0,
    show: null,
    size: 0,
  };
  return ssr;
}

export function EmptySearchAlert() {
  const alert: SearchAlert = {
    text: '',
    type: '',
    matches: [],
  };
  return alert;
}
