import { ipcMain } from 'electron';

// import Tablo from 'tablo-api';
// import { checkConnection } from '../renderer/utils/Tablo';

import { defaultTemplates } from '../renderer/utils/namingTpl';

ipcMain.on('templates-load', async (event: any) => {
  const defaults = defaultTemplates;
  const recs = await globalThis.NamingDb.asyncFind({});

  const all = [...defaults, ...recs];
  globalThis.LoadedTemplates = all;
  try {
    event.returnValue = globalThis.LoadedTemplates;
  } catch (e) {
    console.error('templates-load', e);
    event.returnValue = [];
  }
});
