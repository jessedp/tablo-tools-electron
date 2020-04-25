import os from 'os';

export type ConfigType = {
  autoRebuild: boolean,
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
  // TODO: these are residual from Settings b/c I haven't done the config properly
  saveState?: number,
  saveData: Array<string>
};

export const defaultConfig: ConfigType = {
  autoRebuild: true,
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
  saveData: []
};

export function setConfigItem(key: string, val: string) {
  const storedConfig = getConfig();
  storedConfig[key] = val;
  localStorage.setItem('AppConfig', JSON.stringify(storedConfig));
}

// TODO: should do setConfig. Should redo all of this config mess.
// setConfig Partial<ConfigType> react-hot-loader
export default function getConfig(): ConfigType {
  const storedConfig: ConfigType = JSON.parse(
    localStorage.getItem('AppConfig') || '{}'
  );

  let upgrade = false; // just rewrite it...
  // TODO: remove after 0.0.7
  // change: enableIpOverride => enableTestDevice
  if (Object.prototype.hasOwnProperty.call(storedConfig, 'enableIpOverride')) {
    storedConfig.enableTestDevice = storedConfig.enableIpOverride;
    delete storedConfig.enableIpOverride;
    upgrade = true;
  }
  // change: overrideIp => testDeviceIp
  if (Object.prototype.hasOwnProperty.call(storedConfig, 'overrideIp')) {
    storedConfig.testDeviceIp = storedConfig.overrideIp;
    delete storedConfig.overrideIp;
    upgrade = true;
  }
  if (upgrade) {
    localStorage.setItem('AppConfig', JSON.stringify(storedConfig));
  }
  return Object.assign(defaultConfig, storedConfig);
}
