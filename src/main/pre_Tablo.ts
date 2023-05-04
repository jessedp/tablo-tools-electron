import { ipcMain } from 'electron';

import {
  checkConnection,
  comskipAvailable,
  discover,
  setupApi,
  setCurrentDevice,
} from './utils/Tablo';

import { hasDevice } from './utils/utils';

import { mainDebug } from './utils/logging';

const debug = mainDebug.extend('pre_Tablo');
globalThis.debugInstances.push(debug);

ipcMain.on('tablo-setup-api', async (event: any) => {
  try {
    event.returnValue = await setupApi();
  } catch (e) {
    event.returnValue = e;
  }
});

ipcMain.on('tablo-has-device', async (event: any) => {
  try {
    event.returnValue = await hasDevice();
  } catch (e) {
    event.returnValue = e;
  }
});

ipcMain.on('tablo-device', async (event: any) => {
  event.returnValue = globalThis.Api.device;
});

ipcMain.on('tablo-discoveredDevices', async (event: any) => {
  event.returnValue = global.discoveredDevices;
});

ipcMain.on('tablo-discover', async (event: any) => {
  try {
    event.returnValue = await discover();
  } catch (e) {
    console.error('tablo-discover', e);
    event.returnValue = e;
  }
});

ipcMain.on('tablo-setCurrentDevice', async (event: any, device: any) => {
  try {
    await setCurrentDevice(device);
    event.returnValue = true;
  } catch (e) {
    console.error('tablo-setCurrentDevice', e);
    event.returnValue = false;
  }
});

ipcMain.on('tablo-isConnected', async (event: any) => {
  try {
    event.returnValue = global.isConnected;
  } catch (e) {
    console.error('tablo-isConnected', e);
    event.returnValue = false;
  }
});

ipcMain.on('tablo-checkConnection', async (event: any) => {
  try {
    event.returnValue = await checkConnection();
  } catch (e) {
    console.error('tablo-checkConnection', e);
    event.returnValue = false;
  }
});

ipcMain.on('tablo-comskipAvailable', async (event: any) => {
  try {
    const avail = comskipAvailable();
    event.returnValue = avail;
  } catch (e) {
    console.error('tablo-comskipAvailable Error: ', e);
    event.returnValue = false;
  }
});

ipcMain.on('tablo-getRecordingsCount', async (event: any) => {
  try {
    event.returnValue = await globalThis.Api.getRecordingsCount();
  } catch (e) {
    console.error(e);
    event.returnValue = false;
  }
});

ipcMain.handle('tablo-getRecordings', async (_event: any, force: string) => {
  try {
    ipcMain.emit('get-recording-progress', 0);
    const cb = (val: number) => {
      ipcMain.emit('get-recording-progress', val);
    };
    const recs = await globalThis.Api.getRecordings(force, cb);

    return recs;
  } catch (e) {
    console.error('tablo-getRecordings', e);
    return {};
  }
});

ipcMain.on('tablo-getServerInfo', async (event: any) => {
  try {
    event.returnValue = await globalThis.Api.getServerInfo();
  } catch (e) {
    debug('tablo-getServerInfo %O', e);
    console.error(e);
    event.returnValue = {};
  }
});

ipcMain.on('tablo-batch', async (event: any, ids: any) => {
  try {
    const recs = await globalThis.Api.batch(ids);
    event.returnValue = recs;
  } catch (e) {
    console.error('tablo-batch', e);
    event.returnValue = ['error', `${e}`];
  }
});

ipcMain.on('tablo-get', async (event: any, query: any) => {
  try {
    const recs = await globalThis.Api.get(query);
    event.returnValue = recs;
  } catch (e) {
    console.error('tablo-get', e);
    event.returnValue = {};
  }
});

ipcMain.on('tablo-post', async (event: any, query: any) => {
  try {
    const recs = await globalThis.Api.post(query);
    event.returnValue = recs;
  } catch (e) {
    console.error('tablo-post', e);
    event.returnValue = {};
  }
});

ipcMain.on('tablo-patch', async (event: any, path: string, query: any) => {
  try {
    const recs = await globalThis.Api.patch(path, query);
    event.returnValue = recs;
  } catch (e) {
    console.error('tablo-patch', e);
    event.returnValue = {};
  }
});

ipcMain.on('tablo-delete', async (event: any, query: any) => {
  try {
    const result = await globalThis.Api.delete(query);
    debug('tablo-delete %O', result.data);
    event.returnValue = result.data;
  } catch (e) {
    console.error('tablo-delete', e);
    event.returnValue = {};
  }
});
