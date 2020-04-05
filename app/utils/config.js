import os from 'os';

export type ConfigType = {
  episodePath: string,
  moviePath: string,
  eventPath: string,
  enableIpOverride: boolean,
  autoRebuild: boolean,
  overrideIp: string,
  enableExportData: boolean,
  exportDataPath: string,
  saveState?: number,
  saveData: Array<string>
};

export const defaultConfig: ConfigType = {
  episodePath: `${os.homedir()}/TabloRecordings/TV`,
  moviePath: `${os.homedir()}/TabloRecordings/Movies`,
  eventPath: `${os.homedir()}/TabloRecordings/Events`,
  enableIpOverride: false,
  autoRebuild: true,
  overrideIp: '',
  enableExportData: false,
  exportDataPath: `${os.tmpdir()}/tablo-data/`,
  saveData: []
};

export default function getConfig() {
  const storedConfig = JSON.parse(localStorage.getItem('AppConfig') || '{}');
  return Object.assign(defaultConfig, storedConfig);
}
