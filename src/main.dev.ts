/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Store from 'electron-store';
import MenuBuilder from './menu';

const { ipcMain, dialog } = require('electron');

Store.initRenderer();

ipcMain.on('get-path-main', (event: any, arg: any) => {
  event.returnValue = app.getPath(arg);
});

ipcMain.on('get-version', (event: any) => {
  event.returnValue = app.getVersion();
});

ipcMain.on('get-name', (event: any) => {
  event.returnValue = app.name;
});

ipcMain.on('open-dialog', (event: any, arg: any) => {
  const file = dialog.showOpenDialogSync(arg);
  event.returnValue = file;
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

ipcMain.on('open-path', (event: any, arg: string) => {
  if (arg) shell.openPath(path.dirname(arg));
});

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

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
      // nodeIntegration: false,
      // enableRemoteModule: false,
      // contextIsolation: true,
      // sandbox: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
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

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
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

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});