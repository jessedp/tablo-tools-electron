import { debug } from 'console';
import { app, ipcMain } from 'electron';

// import Tablo from 'tablo-api';
// import { checkConnection } from '../renderer/utils/Tablo';
import {
  checkConnection,
  comskipAvailable,
  discover,
  setupApi,
  setCurrentDevice,
} from './utils/Tablo';

import { hasDevice } from './utils/utils';

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

ipcMain.on('tablo-CONNECTED', async (event: any) => {
  try {
    event.returnValue = global.CONNECTED;
  } catch (e) {
    console.error('tablo-CONNECTED', e);
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
    debug('tablo-comskipAvailable: avail = ', avail);
    event.returnValue = avail;
  } catch (e) {
    console.error('tablo-comskipAvailable', e);
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

ipcMain.handle('tablo-getRecordings', async (event: any, force: string) => {
  try {
    ipcMain.emit('get-recording-progress', 0);
    const cb = (val: number) => {
      ipcMain.emit('get-recording-progress', val);
    };
    const recs = await globalThis.Api.getRecordings(force, cb);

    return recs;
  } catch (e) {
    console.error('tablo-getRecordings', e);
    event.returnValue = {};
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
    event.returnValue = ['error', e];
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
    console.error('tablo-get', e);
    event.returnValue = {};
  }
});

ipcMain.on('tablo-delete', async (event: any, query: any) => {
  try {
    const recs = await globalThis.Api.delete(query);
    event.returnValue = recs;
  } catch (e) {
    console.error('tablo-delete', e);
    event.returnValue = {};
  }
});
