import getConfig from './config';

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

export function sortableTitle(titleToSort) {
  let title = titleToSort.toLowerCase().trimLeft();

  const articles = ['a', 'an', 'the'];
  const words = title.split(' ', 2);
  if (words.length === 1) {
    if (/^\d(.*)/.test(title)) {
      title = `zzz ${title}`;
    }
    return title;
  }

  // console.log(words[0].toLowerCase());
  // if (words[0].toLowerCase() in articles){
  if (articles.includes(words[0])) {
    [, title] = words;
  }

  if (/^\d(.*)/.test(title)) {
    title = `zzz ${title}`;
  }

  return title;
}

export function ellipse(str: string, length: number, ellipsis: string = '...') {
  if (str.length > length) return `${str.substr(0, length)}${ellipsis}`;
  return str;
}

export function sortObject(obj) {
  const ordered = {};
  Object.keys(obj)
    .sort()
    .forEach(key => {
      ordered[key] = obj[key];
    });
  return ordered;
}

export function timeStrToSeconds(str) {
  const arr = str.split(':');
  let retVal =
    parseFloat(arr[0], 10) * 60 * 60 +
    parseFloat(arr[1], 10) * 60 +
    parseFloat(arr[2], 10);
  retVal = Math.round(retVal);
  return retVal;
}

export function secondsToTimeStr(time, seperator?: string) {
  const secNum = parseInt(time, 10);
  const hours = Math.floor(secNum / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((secNum - hours * 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (secNum - hours * 3600 - minutes * 60)
    .toString()
    .padStart(2, '0');

  const sep = seperator || '';

  return `${hours}${sep}${minutes}${sep}${seconds}`;
}

export function readableDuration(duration) {
  const date = new Date(null);
  date.setSeconds(duration);
  const str = date.toISOString().substr(12, 7);
  return str.replace(/^0:/, '');
}

export function parseSeconds(duration) {
  let dur = duration;
  const min = 60;
  const hour = min * 60;
  const day = hour * 24;
  const month = day * 30;
  const months = parseInt(dur / month, 10);
  dur -= months * month;
  const days = parseInt(dur / day, 10);
  dur -= days * day;
  const hours = parseInt(dur / hour, 10);
  dur -= hours * hour;
  const minutes = parseInt(dur / min, 10);
  dur -= minutes * min;

  // console.log(minutes,)

  return [months, days, hours, minutes, dur];
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
  const config = getConfig();
  if (!config) return;
  if (!Object.prototype.hasOwnProperty.call(config, 'enableExportData')) {
    return;
  }
  if (!config.enableExportData) return;

  const path = config.exportDataPath;
  try {
    fs.mkdirSync(config.exportDataPath, { recursive: true }, err => {
      console.error(err);
    });
  } catch (e) {
    console.log(e);
  }
  let outData = data;
  if (typeof data === 'object') outData = JSON.stringify(data);
  const outFile = `${path}${name}`;
  fs.writeFileSync(outFile, outData);
}

/**
 * Performs a list of callable actions (promise factories) so that only a limited
 * number of promises are pending at any given time.
 *
 * https://stackoverflow.com/questions/38385419/throttle-amount-of-promises-open-at-a-given-time
 *
 * @param listOfCallableActions An array of callable functions, which should
 *     return promises.
 * @param limit The maximum number of promises to have pending at once.
 * @param progressCallback An optional callback for each set of results
 * @returns A Promise that resolves to the full list of values when everything is done.
 */
export function throttleActions(
  listOfCallableActions,
  limit,
  progressCallback?: Function
) {
  // We'll need to store which is the next promise in the list.
  let i = 0;
  const resultArray = new Array(listOfCallableActions.length);

  // Now define what happens when any of the actions completes. Javascript is
  // (mostly) single-threaded, so only one completion handler will call at a
  // given time. Because we return doNextAction, the Promise chain continues as
  // long as there's an action left in the list.
  function doNextAction() {
    if (i < listOfCallableActions.length) {
      // Save the current value of i, so we can put the result in the right place
      const actionIndex = i;
      const nextAction = listOfCallableActions[actionIndex];
      i += 1;
      return Promise.resolve(nextAction())
        .then(result => {
          // Save results to the correct array index.
          resultArray[actionIndex] = result;
          if (progressCallback) progressCallback(1);
          // eslint-disable-next-line no-useless-return
          return result;
        })
        .then(doNextAction);
    }
  }

  // Now start up the original <limit> number of promises.
  // i advances in calls to doNextAction.
  const listOfPromises = [];
  while (i < limit && i < listOfCallableActions.length) {
    listOfPromises.push(doNextAction());
  }
  return Promise.all(listOfPromises).then(() => resultArray);
}
