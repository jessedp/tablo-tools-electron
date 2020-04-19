import Store from 'electron-store';
import { formatDistanceToNow } from 'date-fns';

const path = require('path');

const { AsyncNedb } = require('nedb-async');

const electron = require('electron');

const dataDir = (electron.app || electron.remote.app).getPath('userData');

const store = new Store();
const device = store.get('last_device');

const recDbName = `${device.server_id}-recordings.db`;
const showDbName = `${device.server_id}-show.db`;

export const recFile = path.join(dataDir, recDbName);
export const showFile = path.join(dataDir, showDbName);
// TODO: check/delete old recordings/shows dbs - have to get at IndexDB

export async function recDbStats() {
  return RecDb.asyncCount({});
}

export function recDbCreated() {
  return localStorage.getItem('LastDbBuild');
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

export const RecDb = new AsyncNedb({
  filename: recFile,
  autoload: true,
  inMemoryOnly: false
});
export const ShowDb = new AsyncNedb({
  filename: showFile,
  autoload: true,
  inMemoryOnly: false
});
