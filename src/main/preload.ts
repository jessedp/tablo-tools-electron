import { contextBridge, ipcRenderer, shell, webFrame } from 'electron';

import * as fs from 'fs';
import * as os from 'os';

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, ...args: any) => ipcRenderer.send(channel, ...args),
  sendSync: (channel: string, ...args: any) =>
    ipcRenderer.sendSync(channel, ...args),
  getContentBounds() {
    return ipcRenderer.sendSync('get-content-bounds'); // win.getContentBounds();
  },
  on(channel: any, func: any) {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  once(channel: any, func: any) {
    const validChannels = ['ipc-example'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.once(channel, (event, ...args) => func(...args));
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
  statSync: (path: any, options: any) => fs.statSync(path, options),
});

contextBridge.exposeInMainWorld('os', {
  homedir: () => os.homedir(),
  tmpdir: () => os.tmpdir(),
});

contextBridge.exposeInMainWorld('db', {
  setup: () => ipcRenderer.sendSync('db-setup'),

  find: (db: string, query: any) => ipcRenderer.sendSync('db-find', db, query),

  asyncFind: (db: string, query: any, options: any = {}) =>
    ipcRenderer.sendSync('db-async-find', db, query, options),

  asyncFindOne: (db: string, query: any, options: any = {}) =>
    ipcRenderer.sendSync('db-findOne', db, query, options),

  asyncCount: (db: string, query: any) =>
    ipcRenderer.sendSync('db-count', db, query),

  asyncInsert: (db: string, query: any) =>
    ipcRenderer.sendSync('db-insert', db, query),

  asyncRemove: (db: string, query: any, options?: any) => {
    console.log(
      `asyncRemove - db = ${db} , query = ${JSON.stringify(
        query
      )} , options = ${JSON.stringify(options)}`
    );
    ipcRenderer.sendSync('db-remove', db, query, options);
  },

  asyncUpdate: (db: string, query: any, options?: any) => {
    console.log(
      `asyncUpdate - db = ${db} , query = ${JSON.stringify(
        query
      )} , options = ${JSON.stringify(options)}`
    );
    ipcRenderer.sendSync('db-update', db, query, options);
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
  getServerInfo: () => ipcRenderer.sendSync('tablo-getServerInfo'),
  batch: (ids: any) => ipcRenderer.sendSync('tablo-batch', ids),
  get: (query: any) => ipcRenderer.sendSync('tablo-get', query),
  post: (query: any) => ipcRenderer.sendSync('tablo-post', query),
  delete: (query: any) => ipcRenderer.sendSync('tablo-delete', query),
});

contextBridge.exposeInMainWorld('Airing', {
  exportVideo: (airing_id: string, actionOnDuplicate: string) =>
    ipcRenderer.invoke('airing-export', airing_id, actionOnDuplicate),
  dedupedExportFile: (airing: any, actionOnDuplicate: string) =>
    ipcRenderer.sendSync('airing-dedupedExportFile', airing, actionOnDuplicate),
  cancelExportVideo: (airing: any, actionOnDuplicate: string) =>
    ipcRenderer.invoke('airing-cancelExportVideo', airing, actionOnDuplicate),
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

  ipcRenderer: {
    getContentBounds() {
      return ipcRenderer.sendSync('get-content-bounds'); // win.getContentBounds();
    },
    myPing() {
      return 'hi!!';
      // ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel: any, func: any) {
      console.log('preload - electron.ipcRenderer.on', channel, func);
      // const validChannels = ['ipc-example'];
      // if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      return ipcRenderer.on(channel, (event, ...args) => func(...args));
      // }
    },
    once(channel: any, func: any) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
});