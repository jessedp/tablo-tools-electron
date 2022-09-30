import { ipcMain } from 'electron';
import log from 'electron-log';
import Debug from 'debug';

const debug = Debug('tablo-tools');
log.transports.file.level = false;
log.transports.file.maxSize = 1048576 * 2;

log.hooks.push((message, transport) => {
  if (transport !== log.transports.file) {
    return message;
  }

  if (message.data[0].includes('password')) {
    return false;
  }

  // from ansi-regex which blows for some reason
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
  ].join('|');

  const re = new RegExp(pattern, 'g');
  message.data.map((item, i) => {
    if (typeof message.data[i] === 'string') {
      message.data[i] = item.replaceAll(re, '');
    }
    return message.data[i];
  }, message.data);

  return message;
});

debug.log = log.log.bind(log);
globalThis.debugInstances = [];

export const mainLog = log;
export const mainDebug = debug;

const enableDebug = () => {
  log.transports.file.level = 'debug';
  globalThis.debugInstances.forEach((item: Debug.Debugger) => {
    item.enabled = true;
    debug('Enabled Debug Logging for: %s', item.namespace);
  });
};

ipcMain.handle('enable-debug-log', () => enableDebug());
ipcMain.on('enable-debug-log', () => enableDebug());

const disableDebug = () => {
  log.transports.file.level = false;
  globalThis.debugInstances.forEach((item: Debug.Debugger) => {
    debug('Disabled Debug Logging for: %s', item.namespace);
    if (!process.env.DEBUG) {
      item.enabled = false;
    }
  });
};
ipcMain.handle('disable-debug-log', () => disableDebug());
ipcMain.on('disable-debug-log', () => disableDebug());
