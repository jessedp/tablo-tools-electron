const fs = require('fs');

export async function asyncForEach(array, callback) {
  const promises = array.map(callback);
  const vals = Promise.all(promises);
  return vals;
  /**
  for (let index = 0; index < array.length; index+=1) {
    await callback(array[index], index, array);
  }
   */
}

export function timeStrToSeconds(str) {
  const arr = str.split(':');
  const retVal = +arr[0] * 60 * 60 + +arr[1] * 60 + +arr[2];
  return retVal;
}

export function readableDuration(duration) {
  const date = new Date(null);
  date.setSeconds(duration);
  // TODO: whittle down the duration... and/or make it xH:yM:zS
  return date.toISOString().substr(12, 7);
}

export function readableBytes(bytes) {
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const size = (bytes / 1024 ** i).toFixed(2) * 1;
  return `${size} ${sizes[i]}`;
}

export function boolStr(val) {
  if (val === true) return 'yes';
  return 'no';
}

export function isValidIp(addr) {
  const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(addr);
}

export function writeToFile(name, data) {
  const cfg = JSON.parse(localStorage.getItem('AppConfig'));
  if (!cfg.enableExportData) return;

  const path = cfg.exportDataPath;
  try {
    fs.mkdirSync(cfg.exportDataPath, { recursive: true }, err => {
      console.log(err);
    });
  } catch (e) {
    console.log(e);
  }
  const outFile = `${path}${name}`;
  console.log('writing', outFile);
  fs.writeFileSync(outFile, data);
}
