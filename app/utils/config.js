import os from 'os';
import fs from 'fs';
import path from 'path';
import {
  DUPE_ADDID,
  DUPE_INC,
  DUPE_OVERWRITE,
  DUPE_SKIP
} from '../constants/app';

const electron = require('electron');

//
export function getPath(key) {
  if (!process.versions.electron) {
    // Node.js process
    return '';
  }
  if (process.type === 'renderer') {
    // Electron renderer process
    return electron.remote.app.getPath(key);
  }
  // Electron main process
  return electron.app.getPath(key);
}

let cachedConfig = {};

const logsPath = getPath('userData');

export const CONFIG_FILE_NAME = path.normalize(
  `${logsPath}/tablo_tools_config.json`
);

export type ConfigType = {
  autoRebuild: boolean,
  autoRebuildMinutes: number,

  autoUpdate: boolean,
  notifyBeta: boolean,

  episodePath: string,
  moviePath: string,
  eventPath: string,
  programPath: string,

  enableTestDevice: boolean,
  testDeviceIp: string,

  enableExportData: boolean,
  exportDataPath: string,
  allowErrorReport: boolean,
  enableDebug: boolean,

  episodeTemplate: string,
  movieTemplate: string,
  eventTemplate: string,
  programTemplate: string,

  // TODO: enum
  actionOnDuplicate: string,

  // TODO: these are residual from Settings b/c I haven't done the config properly
  saveState?: number,
  saveData: Array<string>
};

export const VALID_DUPE_ACTIONS = [
  DUPE_ADDID,
  DUPE_INC,
  DUPE_OVERWRITE,
  DUPE_SKIP
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

  saveData: []
};

export function setConfigItem(
  key: string | { key: string, val: string },
  val: string
) {
  if (typeof key === 'object') {
    cachedConfig = { ...cachedConfig, ...key };
  } else {
    cachedConfig[key] = val;
  }

  fs.writeFileSync(CONFIG_FILE_NAME, JSON.stringify(cachedConfig));
}

export function setConfig(data: ConfigType) {
  cachedConfig = data;
  fs.writeFileSync(CONFIG_FILE_NAME, JSON.stringify(cachedConfig));
}

export default function getConfig(): ConfigType {
  if (!cachedConfig || !Object.keys(cachedConfig).length) {
    if (fs.existsSync(CONFIG_FILE_NAME)) {
      cachedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE_NAME) || '{}');
    } else {
      cachedConfig = defaultConfig;
    }
  }

  const config = Object.assign(defaultConfig, cachedConfig);
  // allow some global overrides for the CLi
  const overrides = [
    'episodeTemplate',
    'movieTemplate',
    'eventTemplate',
    'programTemplate',
    'actionOnDuplicate'
  ];
  overrides.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(global, key)) {
      config[key] = global[key];
    }
  });

  return config;
}
