import { ipcMain } from 'electron';

import { defaultTemplates } from '../renderer/utils/namingTpl';

import { mainDebug } from './utils/logging';

const debug = mainDebug.extend('pre_templates');
globalThis.debugInstances.push(debug);

ipcMain.on('templates-load', async (event: any) => {
  const defaults = defaultTemplates;
  try {
    const recs = await globalThis.dbs.NamingDb.findAsync({});
    debug('loading templates: ', recs);
    const all = [...defaults, ...recs];
    globalThis.LoadedTemplates = all;
  } catch (e) {
    console.error('templates-load', e);
    debug('templates-load', e);
    globalThis.LoadedTemplates = defaults;
  }
  event.returnValue = globalThis.LoadedTemplates;
});
