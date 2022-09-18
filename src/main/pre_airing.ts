import { ipcMain } from 'electron';
import Debug from 'debug';

import Airing from '../renderer/utils/Airing';

import {
  cancelExportProcess,
  dedupedExportFile,
  getExportDetails,
  exportVideo,
} from './utils/exportVideo';

const debug = Debug('tablo-tools:pre_airing');

ipcMain.on(
  'airing-dedupedExportFile',
  (event: any, airing: Airing, actionOnDuplicate: string, template: any) => {
    try {
      airing.template = template;
      const filename = dedupedExportFile(airing, actionOnDuplicate);
      debug('airing-dedupedExportFile', filename);
      event.returnValue = filename;
    } catch (e) {
      console.error('airing-dedupedExportFile', e);
      event.returnValue = 'error occurred determining export file name';
    }
  }
);

ipcMain.on('airing-getExportDetails', (event: any, airing: Airing) => {
  try {
    const details = getExportDetails(airing);
    debug('airing-getExportDetails details: %s  , %O', typeof details, details);
    event.returnValue = details;
  } catch (e) {
    console.error('airing-getExportDetails', e);
    event.returnValue = 'error occurred determining export file details';
  }
});

ipcMain.handle(
  'airing-cancelExportVideo',
  async (_event: any, airing: Airing) => {
    console.log("ipcMain.handle('airing-cancelExportVideo') ", airing);

    return cancelExportProcess(airing);
  }
);

ipcMain.handle(
  'airing-export',
  async (
    _event: any,
    airing_id: string,
    actionOnDuplicate: string,
    template: any
  ) => {
    try {
      const data = await global.dbs.RecDb.findOneAsync({
        object_id: airing_id,
      });
      const airing = await Airing.create(data);
      airing.template = template;
      const channel = `export-progress`;

      return await exportVideo(airing, actionOnDuplicate, (...args: any) => {
        ipcMain.emit(channel, args);
        // debug(`${channel} - progress - `, airing.id, args);
      });
    } catch (e) {
      debug('ERROR in airing-export: ', e);
      // console.error('airing-export', e);
      // return cancelExportProcess(airing);
      return new Promise((resolve) => {
        resolve(`ERR: airing-export - ${e}`);
      });
    }
  }
);
