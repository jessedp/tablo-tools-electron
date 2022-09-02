import { ipcMain } from 'electron';

// import Tablo from 'tablo-api';
// import { checkConnection } from '../renderer/utils/Tablo';
import { setupDb } from './utils/db';

const debug = require('debug')('tt:db');

// const TabloApi = new Tablo();

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
    try {
      const recs = await globalThis[dbName].asyncFind(query, params);
      event.returnValue = recs;
    } catch (e) {
      debug('db-async-find', e);
      console.error('db-async-find', e);
      event.returnValue = [];
    }
  }
);

ipcMain.on('db-findOne', async (event: any, dbName: string, params: any) => {
  try {
    const recs = await globalThis[dbName].asyncFindOne(params);
    event.returnValue = recs;
  } catch (e) {
    debug('db-findOne', e);
    console.error('db-findOne', e);
    event.returnValue = {};
  }
});

ipcMain.on('db-count', async (event: any, dbName: string, params: any) => {
  try {
    const count = await globalThis[dbName].asyncCount(params);
    event.returnValue = count;
  } catch (e) {
    debug('db-count', dbName, e);
    console.error('db-count', dbName, e);
    event.returnValue = 0;
  }
});

ipcMain.on('db-insert', async (event: any, dbName: string, query: any) => {
  try {
    const count = await globalThis[dbName].asyncInsert(query);
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
      const result = await globalThis[dbName].asyncRemove(
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

      const recs = await globalThis[dbName].asyncUpdate(query, params);
      event.returnValue = recs;
    } catch (e) {
      debug('db-update', e);
      console.error('db-update', e);
      event.returnValue = {};
    }
  }
);
