// import Store from 'electron-store';
import PubSub from 'pubsub-js';
import { formatDistanceToNow } from 'date-fns';
import path from 'path';
import AsyncNedb from 'nedb-async';
import Store from 'electron-store';
import { hasDevice } from './Tablo';
import { getPath } from './config';

const store = new Store();
// const { AsyncNedb } = window.require('nedb-async');
// const { AsyncNedb } = window.electron;

// const Store = window.require('electron-store');

const dataDir = getPath('userData');

// const { store } = window.electron;
// TODO: check/delete old recordings/shows dbs - have to get at IndexDB
export async function recDbStats() {
  return global.RecDb.asyncCount({});
}
export function recDbCreatedDisp() {
  const last = recDbCreated();
  let lastBuild = 'never';

  if (last) {
    lastBuild = formatDistanceToNow(Date.parse(last));
    lastBuild += ' ago';
  }

  return lastBuild;
}
export const makeRecDb = () => {
  const device: any = store.get('CurrentDevice');
  if (!device.serverid) return null;
  const recDbName = `${device.serverid}-recordings.db`;
  const recFile = path.join(dataDir, recDbName);
  return new AsyncNedb({
    filename: recFile,
    autoload: true,
    inMemoryOnly: false,
  });
};
export const makeShowDb = () => {
  const device: any = store.get('CurrentDevice');
  if (!device.serverid) return null;
  const showDbName = `${device.serverid}-show.db`;
  const showFile = path.join(dataDir, showDbName);
  return new AsyncNedb({
    filename: showFile,
    autoload: true,
    inMemoryOnly: false,
  });
};
export const makeSearchDb = () => {
  const showDbName = `saved-search.db`;
  const showFile = path.join(dataDir, showDbName);
  return new AsyncNedb({
    filename: showFile,
    autoload: true,
    inMemoryOnly: false,
  });
};
export const makeChannelDb = () => {
  const device: any = store.get('CurrentDevice');
  if (!device.serverid) return null;
  const channelDbName = `${device.serverid}-channel.db`;
  const channelFile = path.join(dataDir, channelDbName);
  return new AsyncNedb({
    filename: channelFile,
    autoload: true,
    inMemoryOnly: false,
  });
};
export const makeNamingDb = () => {
  const device: any = store.get('CurrentDevice');
  if (!device.serverid) return null;
  const namingDbName = `template-naming.db`;
  const namingFile = path.join(dataDir, namingDbName);
  return new AsyncNedb({
    filename: namingFile,
    autoload: true,
    inMemoryOnly: false,
  });
};
export const makeExportLoggingDb = () => {
  const device: any = store.get('CurrentDevice');
  if (!device.serverid) return null;
  const namingDbName = `export-log.db`;
  const namingFile = path.join(dataDir, namingDbName);
  return new AsyncNedb({
    filename: namingFile,
    autoload: true,
    inMemoryOnly: false,
  });
};
export const setupDb = async () => {
  if (!hasDevice()) return;
  global.RecDb = makeRecDb();
  global.ShowDb = makeShowDb();
  global.ChannelDb = makeChannelDb();
  global.SearchDb = makeSearchDb();
  global.NamingDb = makeNamingDb();
  global.ExportLogDb = makeExportLoggingDb();
  PubSub.publish('DB_CHANGE', true);
};

export const { RecDb, ShowDb } = global;
