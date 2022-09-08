import { ipcMain } from 'electron';
import Debug from 'debug';

import { setupDb } from './utils/db';

const debug = Debug('tablo-tools:db');

ipcMain.on('db-setup', async (event: any) => {
  try {
    event.returnValue = await setupDb();
  } catch (e) {
    debug('db-setup failed! ', e);
    event.returnValue = e;
  }
});

ipcMain.on(
  'db-find',
  async (event: any, dbName: string, query: any, params: any = {}) => {
    try {
      // console.log('db-find event', arg, arg2);
      const recs = await globalThis[dbName].find(query, params);
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
  async (event: any, dbName: string, query: any, params: any = {}) => {
    debug(
      'ENTER db-async-find - dbName = %s | query = %o | params = %o',
      dbName,
      query,
      params
    );
    // let method = async () => {
    //   console.error('ERROR: default db-async-find method called ');
    // };
    const method = globalThis[dbName].findAsync(query);
    debug('db-async-find: "method" is %s', typeof method);
    try {
      // method = async () => globalThis[dbName].findAsync(query);

      debug('db-async-find: "findAsync; method" is %s', typeof method);
      // if (params.sort) {
      //   // method = method.sort = () => params.sort;
      //   method.sort(params.sort);
      // }
      // debug('db-async-find: "method" is %s', typeof method);
      // if (params.skip) {
      //   method.skip(params.skip);
      // }
      debug('db-async-find: "method" is a %s', typeof method);
      debug('db-async-find: "method" ', method);
      // const recs = await method.exec();

      const sort = params.filter((item) => item[0] === 'sort')[0][1];
      const skip = params.filter((item) => item[0] === 'skip')[0][1];
      debug('db-async-find: sort = %o skip = %o', sort, skip);
      const recs = await globalThis[dbName]
        .findAsync(query)
        .sort(sort)
        .skip(skip);
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

ipcMain.on('db-findOne', async (event: any, dbName: string, params: any) => {
  try {
    const recs = await globalThis[dbName].findOneAsync(params);
    event.returnValue = recs;
  } catch (e) {
    debug('db-findOne', e);
    console.error('db-findOne', e);
    event.returnValue = {};
  }
});

ipcMain.on('db-count', async (event: any, dbName: string, params: any) => {
  try {
    const count = await globalThis[dbName].countAsync(params);
    event.returnValue = count;
  } catch (e) {
    debug('db-count', dbName, e);
    console.error('db-count', dbName, e);
    event.returnValue = 0;
  }
});

ipcMain.on('db-insert', async (event: any, dbName: string, query: any) => {
  try {
    const count = await globalThis[dbName].insertAsync(query);
    event.returnValue = count;
  } catch (e) {
    debug('db-insert', e);
    console.error('db-insert', e);
    event.returnValue = 0;
  }
});

ipcMain.on(
  'db-remove',
  async (event: any, dbName: string, query: any, options: any) => {
    try {
      debug(
        `ipcMain - db-remove - dbName = ${dbName} , query = ${JSON.stringify(
          query
        )} , options = ${JSON.stringify(options)}`
      );
      const result = await globalThis[dbName].removeAsync(
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
  async (event: any, dbName: string, query: any, params?: any = {}) => {
    try {
      debug(
        `ipcMain - db-update - dbName = ${dbName} , query = ${JSON.stringify(
          query
        )}, params = ${JSON.stringify(params)}`
      );

      const recs = await globalThis[dbName].updateAsync(query, params);
      event.returnValue = recs;
    } catch (e) {
      debug('db-update', e);
      console.error('db-update', e);
      event.returnValue = {};
    }
  }
);
