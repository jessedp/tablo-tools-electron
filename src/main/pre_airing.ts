import { ipcMain } from 'electron';
import Debug from 'debug';

import Airing from '../renderer/utils/Airing';

import {
  cancelExportProcess,
  dedupedExportFile,
  exportVideo,
} from './utils/exportVideo';

const debug = Debug('tablo-tools:pre_airing');

function getMethods(obj) {
  const res = [];
  for (const m in obj) {
    if (typeof obj[m] === 'function') {
      res.push(m);
    }
  }
  return res;
}

ipcMain.on(
  'airing-dedupedExportFile',
  (event: any, airing: Airing, actionOnDuplicate: string) => {
    try {
      const filename = dedupedExportFile(airing, actionOnDuplicate);
      debug('airing-dedupedExportFile', filename);
      event.returnValue = filename;
    } catch (e) {
      console.error('airing-dedupedExportFile', e);
      event.returnValue = 'error occurred determining export file name';
    }
  }
);

ipcMain.handle(
  'airing-cancelExportVideo',
  async (event: any, airing: Airing) => {
    console.log("ipcMain.handle('airing-cancelExportVideo') ", airing);

    return cancelExportProcess(airing);
  }
);

ipcMain.handle(
  'airing-export',
  async (event: any, airing_id: string, actionOnDuplicate: string) => {
    try {
      // await setupDb();

      // console.log('globalThis.RecDb in pre_airing', globalThis.RecDb);
      // debug('globalThis.RecDb in pre_airing:  %O', globalThis.RecDb);
      // debug('globalThis.RecDb methods -  %O', getMethods(globalThis.RecDb));

      const data = await globalThis.RecDb.asyncFindOne({
        object_id: airing_id,
      });
      // debug('Airing data: %O', data);
      // const airing = await Airing.find(parseInt(airing_id, 10));
      const airing = await Airing.create(data);

      // ipcMain.emit('airing-export-progress - start - ', airing_id, 0);
      // return await exportVideo(airing, actionOnDuplicate, () => {});
      const channel = `export-progress`;
      // ipcMain.emit(channel, 0);

      return await exportVideo(airing, actionOnDuplicate, (...args: any) => {
        ipcMain.emit(channel, args);
        debug(`${channel} - progress - `, airing.id, args);
      });

      // const y: any = exportVideo(airing, actionOnDuplicate, (...args: any) => {
      //   debug('export-progress-callback', args);
      // });
      // await y();
      // debug('YYYYYYYY', y);
      // return 'yay?';
    } catch (e) {
      debug('ERROR in airing-export: ', e);
      // console.error('airing-export', e);
      // return cancelExportProcess(airing);
      return new Promise((resolve) => {
        resolve('ERR: airing-export - ', e);
      });
    }

    // event.returnValue = app.getPath(arg);
  }
);
