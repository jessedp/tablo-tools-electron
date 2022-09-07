export default function getConfig() {
  if (typeof window === 'undefined') {
    return globalThis.config;
  }
  return window.ipcRenderer.sendSync('get-config');
}

export const getPath = (key: any) =>
  window.ipcRenderer.sendSync('get-path-main', key);
// ConfigType,

export const setConfig = (item: Record<string, any>) =>
  window.ipcRenderer.send('set-config', item);

export const setConfigItem = (item: Record<string, any>) =>
  window.ipcRenderer.send('set-config-item', item);
