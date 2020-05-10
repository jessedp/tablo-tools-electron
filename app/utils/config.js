import os from 'os';
import fs from 'fs';
import path from 'path';

const { app } = require('electron').remote;

let cachedConfig = {};

const logsPath = app.getPath('userData');

const CONFIG_FILE_NAME = path.normalize(`${logsPath}/tablo_tools_config.json`);

export type ConfigType = {
  autoRebuild: boolean,
  autoRebuildMinutes: number,
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
  // TODO: these are residual from Settings b/c I haven't done the config properly
  saveState?: number,
  saveData: Array<string>
};

export const defaultConfig: ConfigType = {
  autoRebuild: true,
  autoRebuildMinutes: 30,
  notifyBeta: false,
  episodePath: `${os.homedir()}/TabloRecordings/TV`,
  moviePath: `${os.homedir()}/TabloRecordings/Movies`,
  eventPath: `${os.homedir()}/TabloRecordings/Events`,
  programPath: `${os.homedir()}/TabloRecordings/`,
  enableTestDevice: false,
  testDeviceIp: '',
  enableExportData: false,
  exportDataPath: `${os.tmpdir()}/tablo-data/`,
  allowErrorReport: true,
  enableDebug: false,
  saveData: []
};

export function setConfigItem(key: string, val: string) {
  cachedConfig[key] = val;
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
