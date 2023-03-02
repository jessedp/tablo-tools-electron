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
  ffmpegProfile: string;
  // TODO: these are residual from Settings b/c I haven't done the config properly
  saveState?: number;
  saveData: Array<string>;
  // TODO: old setting to be removed with xfer code looking for it
  enableIpOverride?: boolean;
  overrideIp?: string;
};
