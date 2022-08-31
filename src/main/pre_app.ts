import { app, ipcMain } from 'electron';

import getConfig, { setConfig, setConfigItem } from './utils/config';

ipcMain.on('get-path-main', (event: any, arg: any) => {
  event.returnValue = app.getPath(arg);
});

ipcMain.on('get-version', (event: any) => {
  event.returnValue = app.getVersion();
});

ipcMain.on('get-name', (event: any) => {
  event.returnValue = app.name;
});

ipcMain.on('get-config', (event: any) => {
  globalThis.config = getConfig();
  event.returnValue = globalThis.config;
});

ipcMain.on('set-config', (event: any, arg: any) => {
  try {
    setConfig(arg);
    event.returnValue = true;
  } catch (e) {
    console.error('ERR: set-config', e);
  }
});

// item: Record<string, any>;
ipcMain.on('set-config-item', (event: any, arg: any) => {
  try {
    setConfigItem(arg);
    event.returnValue = true;
  } catch (e) {
    console.error('ERR: set-config-item', e);
  }
});
