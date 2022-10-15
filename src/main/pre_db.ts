import { ipcMain } from 'electron';

import { setupDb } from './utils/db';

import { mainDebug } from './utils/logging';

const debug = mainDebug.extend('pre_db');
globalThis.debugInstances.push(debug);

ipcMain.on('db-setup', async (event: Electron.IpcMainEvent) => {
  try {
    event.returnValue = await setupDb();
  } catch (e) {
    debug('db-setup failed! ', e);
    event.returnValue = e;
  }
});

ipcMain.on(
  'db-find',
  async (
    event: Electron.IpcMainEvent,
    dbName: string,
    query: any,
    params: any = {}
  ) => {
    try {
      // console.log('db-find event', arg, arg2);
      const recs = await globalThis.dbs[dbName].find(query, params);
      // console.log('db-find recs', recs);
      event.returnValue = recs;
    } catch (e) {
      debug('db-find', e);
      console.error('db-find', e);
      event.returnValue = [];
    }
  }
);

ipcMain.on(
  'db-async-find',
  async (
    event: Electron.IpcMainEvent,
    dbName: string,
    query: any,
    params: any = []
  ) => {
    debug(
      'ENTER db-async-find - dbName = %s | query = %o | params = %o',
      dbName,
      query,
      params
    );

    try {
      const extractParam = (key: string, pars: []) => {
        const param = pars.filter((item) => item[0] === key);
        if (param && param[0] && param[0][1]) {
          return param[0][1];
        }
        return null;
      };
      // the switch to @seald-io/nedb requires passing these args fairly differently...
      // parse them from our original param sets and pass those into functions
      const sort = extractParam('sort', params);
      const skip = extractParam('skip', params);
      const limit = extractParam('limit', params);

      debug('db-async-find: sort = %o skip = %o limit = %o', sort, skip, limit);
      const recs = await globalThis.dbs[dbName]
        .findAsync(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);
      event.returnValue = recs;
    } catch (e) {
      debug(
        'db-async-find - db = %s  | query = %o  | params = %o',
        dbName,
        query,
        params,
        e
      );

      console.error('db-async-find', e);
      event.returnValue = [];
    }
  }
);

ipcMain.on(
  'db-findOne',
  async (event: Electron.IpcMainEvent, dbName: string, params: any) => {
    try {
      const recs = await globalThis.dbs[dbName].findOneAsync(params);
      event.returnValue = recs;
    } catch (e) {
      debug('db-findOne', e);
      console.error('db-findOne', e);
      event.returnValue = {};
    }
  }
);

ipcMain.on(
  'db-count',
  async (event: Electron.IpcMainEvent, dbName: string, params: any) => {
    try {
      const count = await globalThis.dbs[dbName].countAsync(params);
      event.returnValue = count;
    } catch (e) {
      debug('db-count', dbName, e);
      console.error('db-count', dbName, e);
      event.returnValue = 0;
    }
  }
);

ipcMain.on(
  'db-insert',
  async (event: Electron.IpcMainEvent, dbName: string, query: any) => {
    try {
      const count = await globalThis.dbs[dbName].insertAsync(query);
      event.returnValue = count;
    } catch (e) {
      debug('db-insert', e);
      console.error('db-insert', e);
      event.returnValue = 0;
    }
  }
);

ipcMain.on(
  'db-remove',
  async (
    event: Electron.IpcMainEvent,
    dbName: string,
    query: any,
    options: any
  ) => {
    try {
      debug(
        `ipcMain - db-remove - dbName = ${dbName} , query = ${JSON.stringify(
          query
        )} , options = ${JSON.stringify(options)}`
      );
      const result = await globalThis.dbs[dbName].removeAsync(
        query,
        options || { multi: false }
      );
      event.returnValue = result;
    } catch (e) {
      debug('db-remove', e);
      console.error('db-remove', e);
      event.returnValue = false;
    }
  }
);

ipcMain.on(
  'db-update',
  async (
    event: Electron.IpcMainEvent,
    dbName: string,
    query: any,
    params: any = {},
    options: any = {}
  ) => {
    try {
      debug(
        'ipcMain - db-update - dbName = %s , query = %o, params = %o , options = %o',
        dbName,
        query,
        params,
        options
      );

      const recs = await globalThis.dbs[dbName].updateAsync(
        query,
        params,
        options
      );
      event.returnValue = recs;
    } catch (e) {
      debug('db-update', e);
      console.error('db-update', e);
      event.returnValue = {};
    }
  }
);
