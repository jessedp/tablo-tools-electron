import { formatDistanceToNow } from 'date-fns';

const fs = require('fs');
const { app } = require('electron').remote;

const { AsyncNedb } = require('nedb-async');

export const recFile = `${app.getPath('userData')}/recordings.db`;
export const showFile = `${app.getPath('userData')}/show.db`;

export function recDbStats() {
  let stats = {};
  if (fs.existsSync(recFile) === true) {
    stats = fs.statSync(recFile);
  }
  return stats;
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

/**
function recDbCreated old kinda

 /**
 let stats = {};
 if (fs.existsSync(recFile) === true) {
    stats = fs.statSync(recFile);
  }
 * */
/**
const { mtime = null, size = 0 } = recDbStats();

let mtimeDisp = "Never";
if (mtime && size > 0) {
  // mtimeDisp = `${mtime.toLocaleDateString()} at ${mtime.toLocaleTimeString()}`;
  mtimeDisp = formatDistanceToNow(mtime, new Date());
}
return mtimeDisp;
   * */

export const RecDb = new AsyncNedb({ filename: recFile, autoload: true });
export const ShowDb = new AsyncNedb({ filename: showFile, autoload: true });
