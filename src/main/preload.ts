import { contextBridge, ipcRenderer, shell, webFrame } from 'electron';

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import checkDiskSpace, { Dependencies } from 'check-disk-space';

// Future me: don't try to use this again - preload is essentially in the Renderer proc
// import { mainDebug } from './utils/logging';

// For better security, should validate the channels:
//    const validChannels = ['ipc-example'];
//    if (validChannels.includes(channel)) {
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, ...args: any) => ipcRenderer.send(channel, ...args),
  sendSync: (channel: string, ...args: any) =>
    ipcRenderer.sendSync(channel, ...args),
  on(channel: any, func: any) {
    ipcRenderer.on(channel, (_event, ...args) => func(...args));
  },
  once(channel: any, func: any) {
    const validChannels = ['ipc-example'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    }
  },
});

contextBridge.exposeInMainWorld('webFrame', {
  getZoomFactor: () => webFrame.getZoomFactor(),
  setZoomFactor: (factor: number) => webFrame.setZoomFactor(factor),
  getZoomLevel: () => webFrame.getZoomLevel(),
  setZoomLevel: (factor: number) => webFrame.setZoomLevel(factor),
});

contextBridge.exposeInMainWorld('fs', {
  writeFileSync: (file: fs.PathOrFileDescriptor, data: any, options?: any) =>
    fs.writeFileSync(file, data, options),
  existsSync: (filepath: fs.PathLike) => fs.existsSync(filepath),
  readFileSync: (filepath: any, options?: any) =>
    fs.readFileSync(filepath, options),
  statSync: (filepath: any, options: any) => fs.statSync(filepath, options),
  // I've done myself few favors in React by not awaiting it elsewhere so it's sync like
  checkDiskSpace: async (directoryPath: string, dependencies?: Dependencies) =>
    checkDiskSpace(directoryPath, dependencies),
});

contextBridge.exposeInMainWorld('path', {
  normalize: (filepath: string) => path.normalize(filepath),
  sep: () => path.sep,
  isAbsolute: (filepath: string) => path.isAbsolute(filepath),
  join: (...args: string[]) => path.join(...args),
});

contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir(),
  tmpdir: () => os.tmpdir(),
});

contextBridge.exposeInMainWorld('db', {
  setup: () => ipcRenderer.sendSync('db-setup'),

  find: (db: string, query: any) => ipcRenderer.sendSync('db-find', db, query),

  findAsync: (db: string, query: any, options: any = []) =>
    ipcRenderer.sendSync('db-async-find', db, query, options),

  findOneAsync: (db: string, query: any, options: any = []) =>
    ipcRenderer.sendSync('db-findOne', db, query, options),

  countAsync: (db: string, query: any) =>
    ipcRenderer.sendSync('db-count', db, query),

  insertAsync: (db: string, query: any) =>
    ipcRenderer.sendSync('db-insert', db, query),

  removeAsync: (db: string, query: any, options?: any) => {
    console.log(
      `removeAsync - db = ${db} , query = ${JSON.stringify(
        query
      )} , options = ${JSON.stringify(options)}`
    );
    ipcRenderer.sendSync('db-remove', db, query, options);
  },

  updateAsync: (db: string, query: any, params: any, options?: any) => {
    console.log(
      `updateAsync - db = ${db} , query = ${JSON.stringify(
        query
      )} , params = ${JSON.stringify(params)} , options = ${JSON.stringify(
        options
      )}`
    );
    ipcRenderer.sendSync('db-update', db, query, params, options);
  },

  dbCreatedKey: () => ipcRenderer.sendSync('db-dbCreatedKey'),
  recDbCreated: () => ipcRenderer.sendSync('db-recDbCreated'),
});

contextBridge.exposeInMainWorld('Tablo', {
  // discover: () => TabloApi.discover(),
  setup: () => ipcRenderer.sendSync('tablo-setup-api'),
  discover: () => ipcRenderer.sendSync('tablo-discover'),
  checkConnection: () => ipcRenderer.sendSync('tablo-checkConnection'),
  comskipAvailable: () => ipcRenderer.sendSync('tablo-comskipAvailable'),
  hasDevice: () => ipcRenderer.sendSync('tablo-has-device'),
  CONNECTED: () => ipcRenderer.sendSync('tablo-CONNECTED'),
  device: () => ipcRenderer.sendSync('tablo-device'),
  discoveredDevices: () => ipcRenderer.sendSync('tablo-discoveredDevices'),
  getRecordingsCount: () => ipcRenderer.sendSync('tablo-getRecordingsCount'),
  getRecordings: (force: boolean, cb?: any) =>
    ipcRenderer.invoke('tablo-getRecordings', force, cb),
  setCurrentDevice: (device: any) =>
    ipcRenderer.sendSync('tablo-setCurrentDevice', device),
  getServerInfo: () => ipcRenderer.sendSync('tablo-getServerInfo'),
  batch: (ids: any) => ipcRenderer.sendSync('tablo-batch', ids),
  get: (query: any) => ipcRenderer.sendSync('tablo-get', query),
  post: (query: any) => ipcRenderer.sendSync('tablo-post', query),
  delete: (query: any) => ipcRenderer.sendSync('tablo-delete', query),
});

contextBridge.exposeInMainWorld('Airing', {
  exportVideo: (airing_id: string, actionOnDuplicate: string, template: any) =>
    ipcRenderer.invoke('airing-export', airing_id, actionOnDuplicate, template),
  dedupedExportFile: (airing: any, actionOnDuplicate: string, template: any) =>
    ipcRenderer.sendSync(
      'airing-dedupedExportFile',
      airing,
      actionOnDuplicate,
      template
    ),
  cancelExportVideo: (airing: any, actionOnDuplicate: string) =>
    ipcRenderer.invoke('airing-cancelExportVideo', airing, actionOnDuplicate),
  getExportDetails: (airing: any) =>
    ipcRenderer.sendSync('airing-getExportDetails', airing),
});

contextBridge.exposeInMainWorld('Templates', {
  load: () => ipcRenderer.sendSync('templates-load'),
});

contextBridge.exposeInMainWorld('electron', {
  shell: {
    openExternal(val: any) {
      shell.openExternal(val);
    },
  },
  store: {
    delete(val: any) {
      return ipcRenderer.sendSync('electron-store-delete', val);
    },
    get(val: any) {
      return ipcRenderer.sendSync('electron-store-get', val);
    },
    set(property: any, val: any) {
      ipcRenderer.send('electron-store-set', property, val);
    },
  },
});
