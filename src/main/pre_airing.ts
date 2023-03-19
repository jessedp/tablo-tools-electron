import { ipcMain } from 'electron';
import path from 'path';

import Airing from '../renderer/utils/Airing';

import {
  cancelExportProcess,
  dedupedExportFile,
  getExportDetails,
  exportVideo,
} from './utils/exportVideo';

import { mainDebug } from './utils/logging';

const debug = mainDebug.extend('pre_airing');
globalThis.debugInstances.push(debug);

ipcMain.on(
  'airing-dedupedExportFile',
  (event: any, airing: Airing, actionOnDuplicate: string, template: any) => {
    try {
      airing.template = template;
      const filename = path.normalize(
        dedupedExportFile(airing, actionOnDuplicate)
      );
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
    debug('airing-cancelExportVideo %O', airing);
    return cancelExportProcess(airing);
  }
);

ipcMain.handle(
  'airing-export',
  async (
    _event: any,
    airingId: string,
    actionOnDuplicate: string,
    template: any
  ) => {
    try {
      const data = await global.dbs.RecDb.findOneAsync({
        object_id: airingId,
      });
      const airing = await Airing.create(data);
      airing.template = template;
      const channel = `export-progress`;

      return await exportVideo(airing, actionOnDuplicate, (...args: any) => {
        ipcMain.emit(channel, ...args);
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
