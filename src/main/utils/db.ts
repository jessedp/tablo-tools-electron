import PubSub from 'pubsub-js';
import path from 'path';

import AsyncNedb from '@seald-io/nedb';

import Store from 'electron-store';

import { hasDevice } from './utils';
import { getPath } from './config';

import { mainDebug } from './logging';

const debug = mainDebug.extend('db');
globalThis.debugInstances.push(debug);

const store = new Store();

const dataDir = getPath('userData');

export const makeRecDb = async () => {
  const device: any = store.get('CurrentDevice');
  if (!device.server_id) return null;
  const recDbName = `${device.server_id}-recordings.db`;
  const recFile = path.join(dataDir, recDbName);
  debug('creating %s at %s', recDbName, recFile);
  const db = new AsyncNedb({ filename: recFile });
  try {
    await db.loadDatabaseAsync();
  } catch (e) {
    console.error('makeRecDb - UNABLE TO db.loadDatabaseAsync', e);
  }
  return db;
};

export const makeShowDb = async () => {
  const device: any = store.get('CurrentDevice');
  if (!device.server_id) return null;
  const showDbName = `${device.server_id}-show.db`;
  const showFile = path.join(dataDir, showDbName);
  debug('creating %s at %s', showDbName, showFile);
  const db = new AsyncNedb({ filename: showFile });
  try {
    await db.loadDatabaseAsync();
  } catch (e) {
    console.error('makeShowDb - UNABLE TO db.loadDatabaseAsync', e);
  }
  return db;
};

export const makeSearchDb = async () => {
  const searchDbName = `saved-search.db`;
  const searchFile = path.join(dataDir, searchDbName);
  debug('creating %s at %s', searchDbName, searchFile);
  const db = new AsyncNedb({ filename: searchFile });
  try {
    await db.loadDatabaseAsync();
  } catch (e) {
    console.error('makeSearchDb - UNABLE TO db.loadDatabaseAsync', e);
  }
  return db;
};

export const makeChannelDb = async () => {
  const device: any = store.get('CurrentDevice');
  if (!device.server_id) return null;
  const channelDbName = `${device.server_id}-channel.db`;
  const channelFile = path.join(dataDir, channelDbName);
  debug('creating %s at %s', channelDbName, channelFile);
  const db = new AsyncNedb({ filename: channelFile });
  try {
    await db.loadDatabaseAsync();
  } catch (e) {
    console.error('makeChannelDb - UNABLE TO db.loadDatabaseAsync', e);
  }
  return db;
};

export const makeNamingDb = async () => {
  const device: any = store.get('CurrentDevice');
  if (!device.server_id) return null;
  const namingDbName = `template-naming.db`;
  const namingFile = path.join(dataDir, namingDbName);
  debug('creating %s at %s', namingDbName, namingFile);
  const db = new AsyncNedb({ filename: namingFile });
  try {
    await db.loadDatabaseAsync();
  } catch (e) {
    console.error('makeNamingDb - UNABLE TO db.loadDatabaseAsync', e);
  }
  return db;
};

export const makeFfmpegProfileDb = async () => {
  const device: any = store.get('CurrentDevice');
  if (!device.server_id) return null;
  const ffmpegDbName = `ffmpeg-profiles.db`;
  const ffmpegFile = path.join(dataDir, ffmpegDbName);
  debug('creating %s at %s', ffmpegDbName, ffmpegFile);
  const db = new AsyncNedb({ filename: ffmpegFile });
  try {
    await db.loadDatabaseAsync();
  } catch (e) {
    console.error('makeFfmpegProfileDb - UNABLE TO db.loadDatabaseAsync', e);
  }
  return db;
};

export const makeExportLoggingDb = async () => {
  const device: any = store.get('CurrentDevice');
  if (!device.server_id) return null;
  const exportDbName = `export-log.db`;
  const exportFile = path.join(dataDir, exportDbName);
  debug('creating %s at %s', exportDbName, exportFile);
  const db = new AsyncNedb({ filename: exportFile });
  try {
    await db.loadDatabaseAsync();
  } catch (e) {
    console.error('makeExportDb - UNABLE TO db.loadDatabaseAsync', e);
  }
  return db;
};

export const setupDb = async () => {
  if (!hasDevice()) {
    debug('No device, skipping setupDb');
    return;
  }
  if (!global.dbs) global.dbs = {};
  global.dbs.RecDb = await makeRecDb();
  global.dbs.ShowDb = await makeShowDb();
  global.dbs.ChannelDb = await makeChannelDb();
  global.dbs.SearchDb = await makeSearchDb();
  global.dbs.NamingDb = await makeNamingDb();
  global.dbs.FfmpegDb = await makeFfmpegProfileDb();
  global.dbs.ExportLogDb = await makeExportLoggingDb();
  PubSub.publish('DB_CHANGE', true);
};
