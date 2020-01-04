import { formatDistanceToNow } from 'date-fns';

const path = require('path');

const { AsyncNedb } = require('nedb-async');

const electron = require('electron');

const dataDir = (electron.app || electron.remote.app).getPath('userData');
export const recFile = path.join(dataDir, 'recordings.db');
export const showFile = path.join(dataDir, 'show.db');

export async function recDbStats() {
  return RecDb.asyncCount({});
  /**
  let stats = {};
  if (fs.existsSync(recFile) === true) {
    stats = fs.statSync(recFile);
  }
  return stats;
   * */
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
