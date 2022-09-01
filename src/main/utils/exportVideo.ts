import FfmpegCommand from 'fluent-ffmpeg';
import log from 'electron-log';
import sanitize from 'sanitize-filename';
import * as fsPath from 'path';
import * as fs from 'fs';

import Airing from 'renderer/utils/Airing';
import { findFfmpegPath } from './utils';
import getConfig from './config';

import {
  // EVENT,// async processVideo(// async processVideo(
  // MOVIE,
  // PROGRAM,
  // SERIES,
  beginTimemark,
  // NamingTemplateType,
  DUPE_ADDID,
  DUPE_OVERWRITE,
  DUPE_SKIP,
  DUPE_INC,
} from '../../renderer/constants/app';

const debug = require('debug')('tt:exportVideo');

globalThis.exportProcs = {};

export const cancelExportProcess = (airing: Airing) => {
  debug(
    'cancelExportProcess',
    airing,
    airing.object_id,
    globalThis.exportProcs[airing.object_id] ? 'has ffMpeg' : 'no ffMpeg!'
  );

  // this is to be clean while Mac doesn't work
  if (
    !globalThis.exportProcs[airing.object_id] ||
    !globalThis.exportProcs[airing.object_id].cmd
  ) {
    debug('cancelExportProcess - No cmd process exists while canceling!');
    return;
  }

  globalThis.exportProcs[airing.object_id].cmd.kill('SIGKILL');

  const { outFile } = globalThis.exportProcs[airing.object_id];
  try {
    fs.unlinkSync(outFile);
  } catch (e) {
    console.error('cancelExportProcess - unable to delete file', e);
    debug(airing.object_id, outFile, e);
  }
};

export const dedupedExportFile = (
  airing: Airing,
  actionOnDuplicate: string = getConfig().actionOnDuplicate
) => {
  // this non-sesnse is because the 'exportFile' getter seems to always return undefined
  let { exportFile } = airing;
  exportFile = airing.cachedExportFile;
  debug('dedupedExportFile - exportFile', exportFile);

  if (
    !fs.existsSync(exportFile) ||
    actionOnDuplicate === DUPE_OVERWRITE ||
    actionOnDuplicate === DUPE_SKIP
  ) {
    return exportFile;
  }

  const parsed = fsPath.parse(exportFile);

  if (actionOnDuplicate === DUPE_ADDID) {
    return fsPath.join(
      parsed.dir,
      `${parsed.name}-${airing.object_id}${parsed.ext}`
    );
  }

  if (actionOnDuplicate === DUPE_INC) {
    let cnt = 1;
    let test;

    do {
      test = fsPath.join(parsed.dir, `${parsed.name}-${cnt}${parsed.ext}`);
      cnt += 1;
    } while (fs.existsSync(test));

    return test;
  }

  return exportFile;
};

export const exportVideo = async (
  airing: Airing,
  actionOnDuplicate: string,
  progressCallback: (...args: Array<any>) => any
) => {
  const userDebug = getConfig().enableDebug;
  let date = new Date()
    .toISOString()
    .replace('T', '_')
    .replace(/:/g, '-')
    .replace(/ /g, '_');
  date = date.slice(0, date.indexOf('.'));
  log.transports.file.fileName = `${airing.object_id}-${sanitize(
    airing.showTitle
  )}-${date}.log`;
  log.transports.file.maxSize = 1048576; // 1mb

  if (!userDebug) {
    log.transports.file.level = false;
  }

  if (userDebug) log.info('start processVideo', new Date());
  if (userDebug) log.info('env', process.env.NODE_ENV);
  // FfmpegCommand.setFfmpegPath(findFfmpegPath(userDebug, log));
  FfmpegCommand.setFfmpegPath(findFfmpegPath(userDebug, log));
  let watchPath: Record<string, any> | undefined;
  let input = '';

  try {
    watchPath = await airing.watch();
    if (!watchPath)
      throw new Error('watchPath undefined after calling watch()');

    input = watchPath.playlist_url;
  } catch (err) {
    if (typeof progressCallback === 'function') {
      progressCallback(airing.object_id, {
        failed: true,
        failedMsg: err,
      });
    }

    debug('Unable to load watch path!', err);

    return new Promise((resolve) => {
      resolve(`${airing.object_id} Unable to load watch path!`);
    });
  }

  const outFile = dedupedExportFile(airing);

  const outPath = fsPath.dirname(outFile);
  if (userDebug) log.info('exporting to path:', outPath);
  if (userDebug) log.info('exporting to file:', outFile);
  fs.mkdirSync(outPath, {
    recursive: true,
  });
  const ffmpegOpts = [
    '-c copy',
    '-y', // overwrite existing files
  ];

  if (process.env.NODE_ENV !== 'production') {
    ffmpegOpts.push('-v 40');
  }

  airing.cmd = FfmpegCommand();
  globalThis.exportProcs[airing.object_id] = { cmd: airing.cmd, outFile };

  return new Promise((resolve) => {
    if (outFile !== airing.exportFile) {
      if (actionOnDuplicate === DUPE_SKIP) {
        progressCallback(airing.object_id, {
          skipped: true,
          finished: true,
        });
        resolve('dupe skip');
      }
    }

    const ffmpegLog: Array<string> = [];
    let record = true;

    airing.cmd
      .input(input)
      .output(outFile)
      .addOutputOptions(ffmpegOpts)
      .on('end', () => {
        log.info('Finished processing');
        if (typeof progressCallback === 'function') {
          progressCallback(airing.object_id, {
            finished: true,
            log: ffmpegLog,
          });
        }

        if (userDebug) log.info(ffmpegLog.join('\n'));
        if (userDebug) log.info('end processVideo', new Date());
        resolve(ffmpegLog);
      })
      .on('error', (err: any) => {
        const errMsg = `An error occurred: ${err}`;
        log.info(errMsg);
        ffmpegLog.push(errMsg);

        if (typeof progressCallback === 'function') {
          if (`${err}`.includes('ffmpeg was killed with signal SIGKILL')) {
            progressCallback(airing.object_id, {
              cancelled: true,
              finished: false,
            });
          } else {
            progressCallback(airing.object_id, {
              failed: true,
              failedMsg: err,
            });
          }
        }

        // reject(err);
        resolve(ffmpegLog);
      })
      .on('stderr', (stderrLine: string) => {
        if (
          !stderrLine.includes('EXT-X-PROGRAM-DATE-TIME') &&
          !stderrLine.includes('hls @') &&
          !stderrLine.includes('tcp @') &&
          !stderrLine.includes('AVIOContext') &&
          !stderrLine.includes('Non-monotonous DTS') &&
          !stderrLine.includes('frame=')
        ) {
          // record from start until airing...
          if (stderrLine.includes('Press [q] to stop, [?] for help')) {
            record = false;
          }

          if (
            stderrLine.includes(
              'No more output streams to write to, finishing.'
            )
          ) {
            record = true;
          }

          if (record) ffmpegLog.push(stderrLine);
          if (userDebug) log.info(`Stderr output: ${stderrLine}`);
        }
      })
      .on('progress', (progress: Record<string, any>) => {
        if (typeof progressCallback === 'function') {
          progressCallback(airing.object_id, progress);
        }
      });

    if (typeof progressCallback === 'function') {
      progressCallback(airing.object_id, {
        timemark: beginTimemark,
      });
    }

    airing.cmd.run();
    // debug('exportVideo - setting auto kill export');
    // setTimeout(() => cancelExportProcess(airing), 15000);
  });
};
