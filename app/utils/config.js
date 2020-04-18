import os from 'os';

export type ConfigType = {
  autoRebuild: boolean,
  notifyBeta: boolean,
  episodePath: string,
  moviePath: string,
  eventPath: string,
  enableIpOverride: boolean,
  overrideIp: string,
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
  enableIpOverride: false,
  overrideIp: '',
  enableExportData: false,
  exportDataPath: `${os.tmpdir()}/tablo-data/`,
  saveData: []
};

export default function getConfig() {
  const storedConfig = JSON.parse(localStorage.getItem('AppConfig') || '{}');
  return Object.assign(defaultConfig, storedConfig);
}
