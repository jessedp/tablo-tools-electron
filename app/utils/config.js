import os from 'os';

export type ConfigType = {
  autoRebuild: boolean,
  notifyBeta: boolean,
  episodePath: string,
  moviePath: string,
  eventPath: string,
  enableTestDevice: boolean,
  testDeviceIp: string,
  enableExportData: boolean,
  exportDataPath: string,
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
  enableTestDevice: false,
  testDeviceIp: '',
  enableExportData: false,
  exportDataPath: `${os.tmpdir()}/tablo-data/`,
  saveData: []
};

export default function getConfig() {
  const storedConfig = JSON.parse(localStorage.getItem('AppConfig') || '{}');
  let upgrade = false; // just rewrite it...
  // TODO: remove 0.0.7
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
