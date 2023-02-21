/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

import updaterLog from 'electron-log';

import Store from 'electron-store';

import { init } from '@sentry/electron/main';

import { resolveHtmlPath } from './util';
import MenuBuilder from './menu';

import setupSentry from '../renderer/sentry';

import { mainDebug } from './utils/logging';
import getConfig from './utils/config';

setupSentry(init);

if (getConfig().enableDebug) {
  console.info('ENABLING DEBUG LOG!');
  ipcMain.emit('enable-debug-log');
}

const debug = mainDebug.extend('main');
globalThis.debugInstances.push(debug);

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
  debug('open-path = ', arg);
  if (arg) {
    if (fs.existsSync(arg) && !fs.statSync(arg).isDirectory()) {
      debug('open-path showItemInFolder');
      shell.showItemInFolder(arg);
    } else if (fs.existsSync(arg) && fs.statSync(arg).isDirectory()) {
      shell.openPath(arg);
    } else if (fs.existsSync(path.dirname(arg))) {
      debug('open-path openPath = ', path.dirname(arg));
      shell.openPath(path.dirname(arg));
    } else {
      console.error(`CAN NOT OPEN "${arg}"`);
    }
  }
});

let mainWindow: BrowserWindow | null = null;

class AppUpdater {
  constructor() {
    autoUpdater.on('error', (error) => {
      // sentry #R
      if (!error.toString().match('ENOENT')) console.error(error);

      const data = {
        available: false,
        error,
        info: {},
      };

      mainWindow?.webContents.send('update-reply', data);
    });

    autoUpdater.on('update-available', (info) => {
      const data = {
        available: true,
        info,
        error: null,
      };
      mainWindow?.webContents.send('update-reply', data);
    });

    autoUpdater.on('update-downloaded', () => {
      mainWindow?.webContents.send('update-downloaded');
    });

    ipcMain.on('search-issues', () => {
      mainWindow?.webContents.send('search-issues');
    });

    ipcMain.on('set-autoupdate-check', () => {
      const autoUpdateOption = getConfig().autoUpdate;

      if (autoUpdateOption) {
        autoUpdater.autoDownload = true;
        autoUpdater.autoInstallOnAppQuit = false;
        autoUpdater.checkForUpdatesAndNotify();
      } else {
        autoUpdater.autoDownload = false;
        autoUpdater.autoInstallOnAppQuit = false;
        console.log(
          'autoUpdate Config option disabled, NOT checking for new version'
        );
      }
    });

    ipcMain.on('update-available-check', () => {
      debug('update-available-check received!');
      try {
        autoUpdater.checkForUpdatesAndNotify();
      } catch (e) {
        console.error('autoUpdater.checkForUpdatesAndNotify problem', e);
      }
    });

    ipcMain.on('update-download-now', () => {
      debug('update-now received!');
      try {
        autoUpdater.autoDownload = true;
        autoUpdater.autoInstallOnAppQuit = true;
        autoUpdater.checkForUpdatesAndNotify();
      } catch (e) {
        console.error('autoUpdater.downloadUpdate problem', e);
      }
    });

    ipcMain.on('update-quit-install', () => {
      debug('update-quit-install received!');
      try {
        autoUpdater.quitAndInstall();
      } catch (e) {
        console.error('autoUpdater.quitAndInstall problem', e);
      }
    });

    const autoUpdateOption = getConfig().autoUpdate;

    autoUpdater.allowPrerelease = false;

    updaterLog.transports.file.level = 'info';
    autoUpdater.logger = updaterLog;

    if (autoUpdateOption) {
      autoUpdater.autoDownload = true;
      autoUpdater.autoInstallOnAppQuit = false;
    } else {
      autoUpdater.autoDownload = false;
      autoUpdater.autoInstallOnAppQuit = false;
      console.log(
        'autoUpdate Config option disabled, NOT checking for new version'
      );
      return;
    }

    try {
      autoUpdater.checkForUpdatesAndNotify();
    } catch (e) {
      console.error(
        'Problem running autoUpdater.checkForUpdatesAndNotify()',
        e
      );
    }
  }
}

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('get-recording-progress', async (progressData) => {
  debug('get-recording-progress', progressData);
  mainWindow?.webContents.send('get-recording-progress', progressData);
});

ipcMain.on('export-progress', async (...args) => {
  const channel = `export-progress-${args[0]}`;
  debug(`export-progress - channel: ${channel}`);
  debug('export-progress - args[1]: %o', args[1]);
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
      // sandbox: false,
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
    mainWindow?.webContents.send('enter-full-screen');
  });

  mainWindow.on('leave-full-screen', () => {
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
