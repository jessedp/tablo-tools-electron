/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import Debug from 'debug';

import { init } from '@sentry/electron/main';

import { resolveHtmlPath } from './util';
import MenuBuilder from './menu';

import setupSentry from '../renderer/sentry';

setupSentry(init);

const debug = Debug('tablo-tools:main');

require('./pre_app');
require('./pre_Tablo');
require('./pre_db');
require('./pre_airing');
require('./pre_templates');

ipcMain.on('open-dialog', (event: any, arg: any) => {
  const file = dialog.showOpenDialogSync(arg);
  event.returnValue = file;
});

// electron-store
const store = new Store();
ipcMain.on('electron-store-get', async (event, val) => {
  event.returnValue = store.get(val);
});
ipcMain.on('electron-store-set', async (_, key, val) => {
  store.set(key, val);
});
ipcMain.on('electron-store-delete', async (_, key) => {
  store.delete(key);
});

/** Full screen stuff */
ipcMain.on('is-fullscreen', (event: any) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  event.returnValue = win ? win.isFullScreen() : false;
});

ipcMain.on('set-fullscreen', (event: any, value = false) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.setFullScreen(value);
});

ipcMain.on('get-content-bounds', (event: any) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  event.returnValue = win ? win.getContentBounds() : {};
});

ipcMain.on('open-path', (_, arg: string) => {
  debug('open-path = ', path.dirname(arg));

  if (arg) shell.openPath(path.dirname(arg));
  if (arg) shell.showItemInFolder(arg);
});

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('get-recording-progress', async (progress_data) => {
  debug('get-recording-progress', progress_data);
  mainWindow?.webContents.send('get-recording-progress', progress_data);
});

ipcMain.on('export-progress', async (args) => {
  const channel = `export-progress-${args[0]}`;
  // debug(`export-progress - channel: ${channel}`, args);
  mainWindow?.webContents.send(channel, args[1]);
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      // contextIsolation: false,
      // enableRemoteModule: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      debug('mainWindow opened');
      if (process.env.NODE_ENV !== 'production') {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  mainWindow.on('enter-full-screen', () => {
    // TODO: throttle() or debounce() should work? fire's 50 - 65 times
    mainWindow?.webContents.send('enter-full-screen');
  });

  mainWindow.on('leave-full-screen', () => {
    // TODO: throttle() or debounce() should work? fire's 50 - 65 times
    mainWindow?.webContents.send('leave-full-screen');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
