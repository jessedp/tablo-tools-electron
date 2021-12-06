import * as os from 'os';

// const { exec } = require('child_process');
// import ffmpeg from 'ffmpeg-static-electron';
import ffmpeg from 'ffmpeg-static-electron-jdp';
import getConfig from './config';

const fs = require('fs');

export function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
export async function asyncForEach(
  array: Array<any>,
  callback: (item: any) => Promise<void>
) {
  if (!array) return [];
  const promises = array.map(callback);
  // eslint-disable-next-line compat/compat
  const vals = Promise.all(promises);
  return vals;
  /**
  for (let index = 0; index < array.length; index+=1) {
    await callback(array[index], index, array);
  }
   */
}

/**
 * Alters a title string for sorting:
 * - remove leading articles: a, an, the
 * - adds *zzz* to any title with leading numbers
 *
 * @param {string} titleToSort the title string to munge
 * @return {string} munged title string
 */

export function sortableTitle(titleToSort: string) {
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

/**
 * Takes a string and potentially adds an ellipsis based on the max length of
 * the passed string.
 *
 * The returned string length is max_len(passed_string)+len(ellipsis)
 *
 * @param {string}  str the string the potentially manipulate
 * @param {number} length the maxiumum length of *str* before appending *ellipsis*
 * @param {string} [ellipsis="..."] the string to be appended to *str*
 * @return {string} the potentially ellipsed string
 */
export function ellipse(str: string, length: number, ellipsis = '...') {
  if (str.length > length) return `${str.substr(0, length)}${ellipsis}`;
  return str;
}

/**
 * Title cases a string:
 * * dogs => Dogs
 * * eiffel tower => Eiffel Tower
 *
 * @param {string} title the string the potentially manipulate
 * @return {string} the title cased string
 */
export function titleCase(title: string) {
  const sentence = title.toLowerCase().split(' ');

  for (let i = 0; i < sentence.length; i += 1) {
    sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
  }

  return sentence.join(' ');
}

/**
 * Takes an Tablo imageId and returns it's url based on the host currently
 * in use by the API
 *
 * @param {string} title the string the potentially manipulate
 * @return {string} the title cased string
 */
export function getTabloImageUrl(imageId: string | number) {
  const host = (global as any).Api.device.private_ip;
  let id = 0;
  if (typeof imageId === 'string') {
    id = parseInt(imageId, 10);
  } else {
    id = imageId;
  }
  return `http://${host}:8885/images/${id}`;
}

/**
 * Takes a number of seconds and returns a relative time string
 * 310 => 0h5m10s
 *
 * reverse of secondsToTimeStr() w/ ':' as separator
 *
 * @param {string} time the number of seconds
 * @return {number} the number of seconds
 */
export function timeStrToSeconds(str: string) {
  const arr = str.split(':');
  let retVal =
    parseInt(arr[0], 10) * 60 * 60 +
    parseInt(arr[1], 10) * 60 +
    parseInt(arr[2], 10);
  retVal = Math.round(retVal);
  return retVal;
}

/**
 * Takes a number of seconds and returns a relative time string
 * 310 => 0h5m10s
 *
 * reverse of timeStrToSeconds w/ ':' as separator
 *
 * @param {string} time the number of seconds
 * @param {string} [separator=""] a separator to use, defaults to
 * @return {string} the number seconds as a relative time string
 */
export function secondsToTimeStr(time: string, seperator = '') {
  const secNum = parseInt(time, 10);
  const h = Math.floor(secNum / 3600);
  const hours = h.toString().padStart(2, '0');
  const m = Math.floor((secNum - h * 3600) / 60);
  const minutes = m.toString().padStart(2, '0');
  const s = secNum - h * 3600 - m * 60;
  const seconds = s.toString().padStart(2, '0');
  return `${hours}${seperator}${minutes}${seperator}${seconds}`;
}

/**
 * Convert a number of seconds into a human readable string
 * almost an alternate/dupe verison of timeStrToSeconds() w/ the separator
 *
 * e.g. 59 (sec) => 00:59 (sec)  , 51 (sec) => 1:01 (1 min, 1 sec),
 *      2350923 => 5:02:03 (5 hr, 2 min, 3 sec)
 *
 * @param {number} duration the number of seconds
 * @return {string} the number seconds as a relative time string
 */
export function readableDuration(duration: number) {
  const date = new Date(0);
  date.setSeconds(duration);
  const str = date.toISOString().substr(12, 7);
  return str.replace(/^0:/, '');
}

/**
 * Takes a number of seconds and returns an array containing the full periods
 * of months, days, hours, minutes, and seconds it constitutes
 *
 *
 * @param {string | number} duration the number of seconds
 * @return {number[]} 5 elements, the full periods of 0 months, 1 days, 2 hours, 3 minutes, and 4 seconds
 */
export function parseSeconds(duration: string | number) {
  let dur;
  if (typeof duration === 'string') {
    dur = parseInt(duration, 10);
  } else {
    dur = duration;
  }

  // let dur = duration;
  const min = 60;
  const hour = min * 60;
  const day = hour * 24;
  const month = day * 30;
  const months = Math.round(dur / month);
  dur -= months * month;
  const days = Math.round(dur / day);
  dur -= days * day;
  const hours = Math.round(dur / hour);
  dur -= hours * hour;
  const minutes = Math.round(dur / min);
  dur -= minutes * min;
  // console.log(minutes,)
  return [months, days, hours, minutes, dur];
}

/**
 * Takes a number of bytes and returns a more human-readable version
 *
 * @param {number} bytes the bytes to interpret
 * @return {string} human readable string
 */
export function readableBytes(bytes: number) {
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  // const size = (bytes / 1024 ** i).toFixed(2) * 1;
  const size = (bytes / 1024 ** i).toFixed(2);
  return `${size} ${sizes[i]}`;
}

/**
 * Return "yes" if val === boolean true, "no" otherwise
 *
 * @param {any} val a value to check
 * @return {string} the title cased string
 */
export function boolStr(val: boolean | number | string) {
  if (val === true) return 'yes';
  return 'no';
}

/**
 * Validates an IP address, irrespective of private/public/etc
 *
 * @param {string} addr an IP address
 * @return {boolean} the result
 */
export function isValidIp(addr: string): boolean {
  const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(addr);
}

export function writeToFile(
  name: string,
  data: string | unknown | Record<string, unknown>
) {
  const config = getConfig();
  if (!config) return;

  if (!Object.prototype.hasOwnProperty.call(config, 'enableExportData')) {
    return;
  }

  if (!config.enableExportData) return;
  const path = config.exportDataPath;

  try {
    fs.mkdirSync(
      config.exportDataPath,
      {
        recursive: true,
      },
      (err: Error) => {
        console.error(err);
      }
    );
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
  listOfCallableActions: Array<any>,
  limit: number,
  progressCallback?: (...args: Array<any>) => any
) {
  // We'll need to store which is the next promise in the list.
  let i = 0;
  const resultArray = new Array(listOfCallableActions.length);

  // Now define what happens when any of the actions completes. Javascript is
  // (mostly) single-threaded, so only one completion handler will call at a
  // given time. Because we return doNextAction, the Promise chain continues as
  // long as there's an action left in the list.
  // TODO: this type definition is cheating!
  function doNextAction(): Promise<void> | undefined {
    if (i < listOfCallableActions.length) {
      // Save the current value of i, so we can put the result in the right place
      const actionIndex = i;
      const nextAction = listOfCallableActions[actionIndex];
      i += 1;
      return Promise.resolve(nextAction())
        .then((result) => {
          // Save results to the correct array index.
          resultArray[actionIndex] = result;
          if (progressCallback) progressCallback(1);
          // eslint-disable-next-line no-useless-return
          return result;
        })
        .then(doNextAction);
    }
    return undefined;
  }

  // Now start up the original <limit> number of promises.
  // i advances in calls to doNextAction.
  const listOfPromises = [];

  while (i < limit && i < listOfCallableActions.length) {
    listOfPromises.push(doNextAction());
  }
  // eslint-disable-next-line compat/compat
  return Promise.all(listOfPromises).then(() => resultArray);
}
export function findFfmpegPath(debug = false, log?: any) {
  const ffmpegPath = ffmpeg.path;
  if (debug && log) log.info('ffmpegPath', ffmpegPath);
  // $FlowFixMe  dirty, but flow complains about process.resourcesPath
  const resourcePath = `${(process as any).resourcesPath}`;
  // TODO - figure out why I did this...
  const psuedoProdPath = resourcePath.replace(
    '/electron/dist/resources',
    '/ffmpeg-static-electron-jdp/bin'
  );
  if (debug && log) log.info('resourcePath', resourcePath);
  if (debug && log) log.info('prodPath', psuedoProdPath);
  let ffmpegPathReal = ffmpegPath;

  /** In dev, the prod path gets returned, so "fix" that * */
  if (process.env.NODE_ENV === 'development') {
    if (os.platform() === 'win32') {
      if (ffmpegPathReal === ffmpegPath) {
        ffmpegPathReal = ffmpegPath.replace(
          '\\app\\',
          '\\node_modules\\ffmpeg-static-electron-jdp\\'
        );
      }
    } else {
      // *nix
      ffmpegPathReal = ffmpegPath.replace(
        '/src/',
        '/node_modules/ffmpeg-static-electron-jdp/'
      );
    }
  }

  if (debug && log)
    log.info('after "app" replacements for dev', ffmpegPathReal);
  if (debug && log) log.info('prodPath exists', fs.existsSync(psuedoProdPath));

  // In true prod (not yarn build/start), ffmpeg is built into resources dir
  // this will likely fall on it's face with "yarn start"
  if (process.env.NODE_ENV === 'production') {
    if (os.platform() === 'darwin') {
      ffmpegPathReal = `${resourcePath}/node_modules/ffmpeg-static-electron-jdp${ffmpegPath}`;
    } else {
      const testStartPath = ffmpegPathReal.replace(
        /^[/|\\]bin/,
        psuedoProdPath
      );

      if (fs.existsSync(testStartPath)) {
        if (debug && log)
          log.info(
            'START replacing ffmpegPathReal for prodPath',
            psuedoProdPath
          );
        ffmpegPathReal = testStartPath;
        if (debug && log)
          log.info('START replaced prodPath for prod', ffmpegPathReal);
      } else {
        if (debug && log)
          log.info(
            'PROD replacing ffmpegPathReal for prodPath',
            psuedoProdPath
          );
        ffmpegPathReal = psuedoProdPath.replace(
          /[/|\\]resources/,
          `/resources/node_modules/ffmpeg-static-electron-jdp${ffmpegPath}`
        );
        if (debug && log)
          log.info('PROD replaced prodPath for prod', ffmpegPathReal);
      }
    }
  } else if (os.platform() === 'win32') {
    // otherwise we can hit the node_modules dir
    ffmpegPathReal = ffmpegPathReal.replace(
      /^\/bin\//,
      './node_modules/ffmpeg-static-electron-jdp/bin/'
    );
  }

  if (debug && log) log.info(`ffmpegPathReal : ${ffmpegPathReal}`);
  return ffmpegPathReal;
}

export const debounce = <T extends (...args: any[]) => any>(
  callback: T,
  waitFor: number
) => {
  let timeout: NodeJS.Timeout | undefined;
  return (...args: Parameters<T>): ReturnType<T> => {
    let result: any;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      result = callback(...args);
    }, waitFor);
    return result;
  };
};

export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  const now = () => new Date().getTime();
  const resetStartTime = () => (startTime = now());
  let timeout: number;
  let startTime: number = now() - waitFor;
  // console.log('throttle', now, startTime);
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    // eslint-disable-next-line compat/compat
    new Promise((resolve) => {
      const timeLeft = startTime + waitFor - now();
      if (timeout) {
        clearTimeout(timeout);
      }
      console.log('throttle - timeLeft', timeLeft);
      console.log(
        'startTime + waitFor <= now()',
        startTime,
        waitFor,
        startTime + waitFor,
        now()
      );
      if (startTime + waitFor <= now()) {
        resetStartTime();
        resolve(func(...args));
      } else {
        timeout = setTimeout(() => {
          resetStartTime();
          resolve(func(...args));
        }, timeLeft);
      }
    });
};
