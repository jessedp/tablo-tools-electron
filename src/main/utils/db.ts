// import Store from 'electron-store';
import PubSub from 'pubsub-js';
import path from 'path';
import AsyncNedb from 'nedb-async';
import Store from 'electron-store';
import Debug from 'debug';
import { hasDevice } from './utils';
import { getPath } from './config';

const debug = Debug('tt:db');

const store = new Store();

const dataDir = getPath('userData');

export async function recDbStats() {
  return global.RecDb.asyncCount({});
}

export const makeRecDb = () => {
  const device: any = store.get('CurrentDevice');
  if (!device.serverid) return null;
  const recDbName = `${device.serverid}-recordings.db`;
  const recFile = path.join(dataDir, recDbName);
  debug('creating %s at %s', recDbName, recFile);
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
  debug('creating %s at %s', showDbName, showFile);
  return new AsyncNedb({
    filename: showFile,
    autoload: true,
    inMemoryOnly: false,
  });
};

export const makeSearchDb = () => {
  const searchDbName = `saved-search.db`;
  const searchFile = path.join(dataDir, searchDbName);
  debug('creating %s at %s', searchDbName, searchFile);
  return new AsyncNedb({
    filename: searchFile,
    autoload: true,
    inMemoryOnly: false,
  });
};

export const makeChannelDb = () => {
  const device: any = store.get('CurrentDevice');
  if (!device.serverid) return null;
  const channelDbName = `${device.serverid}-channel.db`;
  const channelFile = path.join(dataDir, channelDbName);
  debug('creating %s at %s', channelDbName, channelFile);
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
  debug('creating %s at %s', namingDbName, namingFile);
  return new AsyncNedb({
    filename: namingFile,
    autoload: true,
    inMemoryOnly: false,
  });
};

export const makeExportLoggingDb = () => {
  const device: any = store.get('CurrentDevice');
  if (!device.serverid) return null;
  const exportDbName = `export-log.db`;
  const exportFile = path.join(dataDir, exportDbName);
  debug('creating %s at %s', exportDbName, exportFile);
  return new AsyncNedb({
    filename: exportFile,
    autoload: true,
    inMemoryOnly: false,
  });
};

export const setupDb = async () => {
  if (!hasDevice()) {
    debug('No device, skipping setupDb');
    return;
  }

  global.RecDb = makeRecDb();
  global.ShowDb = makeShowDb();
  global.ChannelDb = makeChannelDb();
  global.SearchDb = makeSearchDb();
  global.NamingDb = makeNamingDb();
  global.ExportLogDb = makeExportLoggingDb();
  PubSub.publish('DB_CHANGE', true);
};
