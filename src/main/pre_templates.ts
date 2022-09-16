import { ipcMain } from 'electron';

import Debug from 'debug';

import { defaultTemplates } from '../renderer/utils/namingTpl';

const debug = Debug('tablo-tools:pre_templates');

ipcMain.on('templates-load', async (event: any) => {
  const defaults = defaultTemplates;
  try {
    const recs = await globalThis.dbs.NamingDb.findAsync({});
    debug('loading tempaltes: ', recs);
    const all = [...defaults, ...recs];
    globalThis.LoadedTemplates = all;
  } catch (e) {
    console.error('templates-load', e);
    debug('templates-load', e);
    globalThis.LoadedTemplates = defaults;
  }
  event.returnValue = globalThis.LoadedTemplates;
});
