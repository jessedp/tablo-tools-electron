import { IDefaultOption } from 'renderer/components/FfmpegCmds/defaultOptionsType';
import { ConfigType } from 'renderer/constants/types_config';

export default function getConfig(): ConfigType {
  if (typeof window === 'undefined') {
    return globalThis.config;
  }
  return window.ipcRenderer.sendSync('get-config');
}

export const getPath = (key: any) =>
  window.ipcRenderer.sendSync('get-path-main', key);

export const setConfig = (item: Record<string, any>) =>
  window.ipcRenderer.send('set-config', item);

export const setConfigItem = (item: Record<string, any>) =>
  window.ipcRenderer.send('set-config-item', item);

export function getFfmpegProfile(profileId?: string): IDefaultOption {
  let ffmpegProfile;
  if (typeof window === 'undefined') {
    ffmpegProfile = globalThis.ffmpegProfile;
    if (!ffmpegProfile) {
      console.log('globalThis.ffmpegProfile', globalThis.ffmpegProfile);
      console.error('getFfmpegProfile: need async :(');
      throw new Error('getFfmpegProfile: need async :(');
    }
    return ffmpegProfile;
  }

  ffmpegProfile = window.ipcRenderer.sendSync('get-ffmpeg-profile', profileId);

  return ffmpegProfile;
}
