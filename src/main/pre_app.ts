import { debug } from 'console';
import { app, ipcMain } from 'electron';
import glob from 'glob';
import path from 'path';
import getConfig, {
  CONFIG_FILE_NAME,
  setConfig,
  setConfigItem,
} from './utils/config';
import { writeToFile } from './utils/utils';

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

ipcMain.on('get-config-file-name', (event: any) => {
  event.returnValue = CONFIG_FILE_NAME;
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

ipcMain.on('write-to-file', (event: any, ...args: any) => {
  writeToFile(args[0], args[1]);

  event.returnValue = true;
});

ipcMain.on('glob', (event: any, arg: any) => {
  const { dir, name } = path.parse(arg);
  const results = glob.sync(`${dir}${path.sep}${name}*`);
  debug('glob results', results);
  event.returnValue = results;
});
