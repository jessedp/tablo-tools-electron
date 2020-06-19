import Store from 'electron-store';
import PubSub from 'pubsub-js';
import { formatDistanceToNow } from 'date-fns';
import { hasDevice } from './Tablo';

const path = require('path');

const { AsyncNedb } = require('nedb-async');

const electron = require('electron');

const dataDir = (electron.app || electron.remote.app).getPath('userData');
const store = new Store();

// TODO: check/delete old recordings/shows dbs - have to get at IndexDB

export async function recDbStats() {
  return global.RecDb.asyncCount({});
}

export const dbCreatedKey = () => {
  const dev = store.get('CurrentDevice');
  return `LastDbBuild-${dev.serverid}`;
};

export function recDbCreated() {
  // localStorage.setItem(dbCreatedKey(), null);
  return localStorage.getItem(dbCreatedKey());
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
  const device = store.get('CurrentDevice');
  if (!device.serverid) return null;
  const recDbName = `${device.serverid}-recordings.db`;
  const recFile = path.join(dataDir, recDbName);

  return new AsyncNedb({
    filename: recFile,
    autoload: true,
    inMemoryOnly: false
  });
};

export const makeShowDb = () => {
  const device = store.get('CurrentDevice');
  if (!device.serverid) return null;
  const showDbName = `${device.serverid}-show.db`;
  const showFile = path.join(dataDir, showDbName);

  return new AsyncNedb({
    filename: showFile,
    autoload: true,
    inMemoryOnly: false
  });
};

export const makeSearchDb = () => {
  const device = store.get('CurrentDevice');
  if (!device.serverid) return null;
  const showDbName = `${device.serverid}-search.db`;
  const showFile = path.join(dataDir, showDbName);

  return new AsyncNedb({
    filename: showFile,
    autoload: true,
    inMemoryOnly: false
  });
};

export const makeChannelDb = () => {
  const device = store.get('CurrentDevice');
  if (!device.serverid) return null;
  const channelDbName = `${device.serverid}-channel.db`;
  const channelFile = path.join(dataDir, channelDbName);

  return new AsyncNedb({
    filename: channelFile,
    autoload: true,
    inMemoryOnly: false
  });
};

export const setupDb = async () => {
  if (!hasDevice()) return;

  global.RecDb = makeRecDb();
  global.ShowDb = makeShowDb();
  global.SearchDb = makeSearchDb();
  global.ChannelDb = makeChannelDb();
  PubSub.publish('DB_CHANGE', true);
};
