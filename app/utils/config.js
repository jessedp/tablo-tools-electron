import os from 'os';
import fs from 'fs';
import path from 'path';

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

  episodeTemplte: string,
  movieTemplate: string,
  eventTemplate: string,
  programTemplate: string,

  // TODO: these are residual from Settings b/c I haven't done the config properly
  saveState?: number,
  saveData: Array<string>
};

export const defaultConfig: ConfigType = {
  autoRebuild: true,
  autoRebuildMinutes: 30,

  autoUpdate: true,
  notifyBeta: false,

  episodePath: path.normalize(`${os.homedir()}/TabloRecordings/TV`),
  moviePath: path.normalize(`${os.homedir()}/TabloRecordings/Movies`),
  eventPath: path.normalize(`${os.homedir()}/TabloRecordings/Events`),
  programPath: path.normalize(`${os.homedir()}/TabloRecordings/`),

  enableTestDevice: false,
  testDeviceIp: '',

  enableExportData: false,
  exportDataPath: path.normalize(`${os.tmpdir()}/tablo-data/`),
  allowErrorReport: true,
  enableDebug: false,

  episodeTemplate:
    '{{episodePath}}/{{showTitle}}/Season {{lPad episode.season_number 2}}/{{showTitle}} - s{{lPad episode.season_number 2}}e{{lPad episode.number 2}}.{{EXT}}',
  movieTemplate:
    '{{moviePath}}/{{title}} - {{movie_airing.release_year}}.{{EXT}}',
  eventTemplate: '{{eventPath}}/{{season}} - {{title}}.{{EXT}}',
  programTemplate:
    '{{programPath}}/{{title}}-{{airing_details.datetime}}.{{EXT}}',

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

// TODO: should do setConfig. Should redo all of this config mess.
// setConfig Partial<ConfigType> react-hot-loader
export default function getConfig(): ConfigType {
  if (!cachedConfig || !Object.keys(cachedConfig).length) {
    if (fs.existsSync(CONFIG_FILE_NAME)) {
      cachedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE_NAME) || '{}');
    } else if (typeof localStorage === 'undefined') {
      cachedConfig = defaultConfig;
    } else {
      // TODO: from 0.0.14 - remove localStorage conversion at some point
      const lsConfig = localStorage.getItem('AppConfig');
      if (lsConfig) {
        const storedConfig: ConfigType = JSON.parse(
          localStorage.getItem('AppConfig') || '{}'
        );

        if (Object.keys(storedConfig).length > 0) {
          // TODO: remove sometime after 0.0.7
          // change: enableIpOverride => enableTestDevice
          if (
            Object.prototype.hasOwnProperty.call(
              storedConfig,
              'enableIpOverride'
            )
          ) {
            storedConfig.enableTestDevice = storedConfig.enableIpOverride;
            delete storedConfig.enableIpOverride;
          }
          // change: overrideIp => testDeviceIp
          if (
            Object.prototype.hasOwnProperty.call(storedConfig, 'overrideIp')
          ) {
            storedConfig.testDeviceIp = storedConfig.overrideIp;
            delete storedConfig.overrideIp;
          }
        }
        // localStorage.removeItem('AppConfig');
        cachedConfig = storedConfig;
        fs.writeFileSync(CONFIG_FILE_NAME, JSON.stringify(cachedConfig));
      }
    }
  }

  return Object.assign(defaultConfig, cachedConfig);
}
