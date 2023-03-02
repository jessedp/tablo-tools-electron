import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

import { app } from 'electron';
import {
  DUPE_ADDID,
  DUPE_INC,
  DUPE_OVERWRITE,
  DUPE_SKIP,
  FFMPEG_DEFAULT_PROFILE,
} from '../../renderer/constants/app';
import { ConfigType } from '../../renderer/constants/types_config';

import { mainDebug } from './logging';

const debug = mainDebug.extend('config');
globalThis.debugInstances.push(debug);

type GetPathType =
  | 'home'
  | 'appData'
  | 'userData'
  | 'temp'
  | 'exe'
  | 'module'
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'music'
  | 'pictures'
  | 'videos'
  | 'recent'
  | 'logs'
  | 'crashDumps';

export function getPath(key: GetPathType): string {
  try {
    if (typeof window !== 'undefined') {
      const rcvPath = window.ipcRenderer.sendSync('get-path-main', key);
      console.log('rcvPath', rcvPath);
      return rcvPath;
    }
  } catch (e) {
    console.log('getPath err', e);
  }

  return app.getPath(key);
}

let cachedConfig: Record<string, any> = {};

const logsPath = getPath('userData');

export const CONFIG_FILE_NAME = path.normalize(
  `${logsPath}/tablo_tools_config.json`
);

export const VALID_DUPE_ACTIONS = [
  DUPE_ADDID,
  DUPE_INC,
  DUPE_OVERWRITE,
  DUPE_SKIP,
];
export const defaultConfig: ConfigType = {
  autoRebuild: true,
  autoRebuildMinutes: 30,
  autoUpdate: true,
  notifyBeta: false,
  episodePath: path.normalize(`${os.homedir()}/TabloRecordings/TV`),
  moviePath: path.normalize(`${os.homedir()}/TabloRecordings/Movies`),
  eventPath: path.normalize(`${os.homedir()}/TabloRecordings/Sports`),
  programPath: path.normalize(`${os.homedir()}/TabloRecordings/`),
  enableTestDevice: false,
  testDeviceIp: '',
  enableExportData: false,
  exportDataPath: path.normalize(`${os.tmpdir()}/tablo-data/`),
  allowErrorReport: true,
  enableDebug: false,
  episodeTemplate: 'tablo-tools',
  movieTemplate: 'tablo-tools',
  eventTemplate: 'tablo-tools',
  programTemplate: 'tablo-tools',
  actionOnDuplicate: DUPE_INC,
  ffmpegProfile: FFMPEG_DEFAULT_PROFILE,
  saveData: [],
};

export function setConfigItem(item: Record<string, any>) {
  cachedConfig = { ...cachedConfig, ...item };
  debug(`writing config file - ${CONFIG_FILE_NAME} %O`, cachedConfig);
  fs.writeFileSync(CONFIG_FILE_NAME, JSON.stringify(cachedConfig));
}

export function setConfig(data: ConfigType) {
  cachedConfig = data;
  fs.writeFileSync(CONFIG_FILE_NAME, JSON.stringify(cachedConfig));
}

export default function getConfig(): any {
  if (!cachedConfig || !Object.keys(cachedConfig).length) {
    if (fs.existsSync(CONFIG_FILE_NAME)) {
      const string = new TextDecoder().decode(
        fs.readFileSync(CONFIG_FILE_NAME)
      );

      // console.log('ERRRR', fs.readFileSync(CONFIG_FILE_NAME));
      // console.log('CFG FILE: ', CONFIG_FILE_NAME);
      // console.log('FUCCCCCCCCCCKKKKKK');
      // console.log('ERRRR', fs.readFileSync(CONFIG_FILE_NAME).toString());
      cachedConfig = JSON.parse(string);
      // console.log('WORKY???', string);
      // cachedConfig = JSON.parse(fs.readFileSync(string || '{}'));
    }
  }
  return Object.assign(defaultConfig, cachedConfig);
}
