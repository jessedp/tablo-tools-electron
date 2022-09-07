import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import Debug from 'debug';

import {
  DUPE_ADDID,
  DUPE_INC,
  DUPE_OVERWRITE,
  DUPE_SKIP,
} from '../../renderer/constants/app';

const debug = Debug('tablo-tools:config');

type GetPathType =
  | 'home'
  | 'appData'
  | 'userData'
  | 'cache'
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
  // if (!process.versions.electron) {
  //   // Node.js process
  //   // FiXME: for tests? this maybe should be "./" ... ? should be cleaned up? tests should create?
  //   const tmpPath = path.normalize(`${os.tmpdir}/tablo-tools-testing/`);
  //   fs.mkdirSync(tmpPath, { recursive: true });
  //   return tmpPath;
  // }
  // console.log('homedir', window.os.homedir());

  // console.log('process.type', process.type);

  // console.log('get-path-main', window.ipcRenderer.sendSync('get-path-main'));
  // const rcvPath = window.electron.ipcRenderer.myPing();

  // const rcvPath = window.ipcRenderer.sendSync('get-path-main', key);
  // console.log('rcvPath', rcvPath);
  // // const rcvPath = app.getPath(key);
  // return rcvPath;
  debug(`${process.type} - getPath() - key  = [${key}]`);
  try {
    // if (process.type === 'renderer') {
    if (typeof window !== 'undefined') {
      const rcvPath = window.ipcRenderer.sendSync('get-path-main', key);
      console.log('rcvPath', rcvPath);
      return rcvPath;
    }
  } catch (e) {
    console.log('getPath err', e);
  }
  // console.log('process.type', process.type);
  // // Electron main process
  const { app } = require('electron');

  return app.getPath(key);
}

let cachedConfig: Record<string, any> = {};

const logsPath = getPath('userData');

export const CONFIG_FILE_NAME = path.normalize(
  `${logsPath}/tablo_tools_config.json`
);

export type ConfigType = {
  autoRebuild: boolean;
  autoRebuildMinutes: number;
  autoUpdate: boolean;
  notifyBeta: boolean;
  episodePath: string;
  moviePath: string;
  eventPath: string;
  programPath: string;
  enableTestDevice: boolean;
  testDeviceIp: string;
  enableExportData: boolean;
  exportDataPath: string;
  allowErrorReport: boolean;
  enableDebug: boolean;
  episodeTemplate: string;
  movieTemplate: string;
  eventTemplate: string;
  programTemplate: string;
  // TODO: enum
  actionOnDuplicate: string;
  // TODO: these are residual from Settings b/c I haven't done the config properly
  saveState?: number;
  saveData: Array<string>;
  // TODO: old setting to be removed with xfer code looking for it
  enableIpOverride?: boolean;
  overrideIp?: string;
};
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
  saveData: [],
};

export function setConfigItem(item: Record<string, any>) {
  cachedConfig = { ...cachedConfig, ...item };
  console.log(
    `writing config file - ${CONFIG_FILE_NAME}\n${JSON.stringify(cachedConfig)}`
  );
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
