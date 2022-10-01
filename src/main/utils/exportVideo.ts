import { execSync } from 'child_process';
import FfmpegCommand from 'fluent-ffmpeg';
import log from 'electron-log';
import sanitize from 'sanitize-filename';
import * as fsPath from 'path';
import * as fs from 'fs';
import Debug from 'debug';

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

const debug = Debug('tablo-tools:exportVideo');

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
  // sometimes (windows) takes a second to release the export file. try to wait on it.
  setTimeout(() => {
    try {
      fs.unlinkSync(outFile);
    } catch (e) {
      console.error('cancelExportProcess - unable to delete file', e);
      debug(airing.object_id, outFile, e);
    }
  }, 1500);
  delete globalThis.exportProcs[airing.object_id];
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

export const getExportDetails = (airing: Airing) => {
  const { cachedExportFile } = airing;
  if (!fs.existsSync(cachedExportFile)) {
    debug(`getExportDetails - missing exportFile : ${cachedExportFile}`);
    return '';
  }
  // this is janky becuase it should be using ffprobe, but
  // I don't want to package it, too. So ffmpeg returns with an
  // error on the shell and the last line of output is
  const lastLine = 'At least one output file must be specified';
  const firstLine = /^Error: Command failed:(.*)/;
  const ffmpeg = findFfmpegPath();
  debug('getExportDetails - findFfmpegPath %s', ffmpeg);
  let info;

  // the non-zero return on the shell causes an error that we then catch...
  try {
    info = execSync(`${ffmpeg} -i "${cachedExportFile}"`);
  } catch (e) {
    // console.error('getExportDetails Error: ', e);
    // debug('getExportDetails Error: ', e);
    info = `${e}`;
  }
  // and munge the output
  info = info.toString().trim();
  info = info.replace(firstLine, '').replace(lastLine, '');
  debug('getExportDetails info = ', info);
  return info;
};

/** take an airing, dupe action, use ffmpeg to export it somewhere   */

export const exportVideo = async (
  airing: Airing,
  actionOnDuplicate: string,
  progressCallback: (...args: Array<any>) => any
) => {
  debug('exportVideo - actionOnDuplicate %s', actionOnDuplicate);
  // noop it so we don't spread the typeof check everywhere
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  let progressCb = (..._args: Array<any>) => {};
  if (typeof progressCallback === 'function') {
    progressCb = progressCallback;
  }

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
    progressCb(airing.object_id, {
      failed: true,
      failedMsg: err,
    });

    debug('Unable to load watch path!', err);

    return new Promise((resolve) => {
      resolve(`${airing.object_id} Unable to load watch path!`);
    });
  }
  let outFile = '';
  try {
    outFile = dedupedExportFile(airing, actionOnDuplicate);
  } catch (err) {
    progressCb(airing.object_id, {
      failed: true,
      failedMsg: err,
    });

    debug('exportVideo - dedupedExportFile failed: ', err);

    return new Promise((resolve) => {
      resolve(`${airing.object_id} Unable to export file name!`);
    });
  }

  try {
    const outPath = fsPath.dirname(outFile);
    if (userDebug) log.info('exporting to path:', outPath);
    if (userDebug) log.info('exporting to file:', outFile);
    fs.mkdirSync(outPath, {
      recursive: true,
    });
  } catch (err) {
    progressCb(airing.object_id, {
      failed: true,
      failedMsg: err,
    });

    debug('exportVideo - create output dirs for: %s ', outFile, err);

    return new Promise((resolve) => {
      resolve(`${airing.object_id} Unable to export file name!`);
    });
  }

  debug('exportVideo - outfile: %s ', outFile);
  debug('exportVideo - actionOnDuplicate : %s ', actionOnDuplicate);

  if (fs.existsSync(outFile)) {
    if (actionOnDuplicate === DUPE_SKIP) {
      progressCb(airing.object_id, {
        skipped: true,
        finished: true,
        log: 'Duplicate, skipping based on configuration value',
      });
      return new Promise((resolve) => {
        resolve('dupe skip');
      });
    }
  }

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
    const ffmpegLog: Array<string> = [];
    let record = true;

    airing.cmd
      .input(input)
      .output(outFile)
      .addOutputOptions(ffmpegOpts)
      .on('end', () => {
        log.info('Finished processing');

        progressCb(airing.object_id, {
          finished: true,
          log: ffmpegLog,
        });

        if (userDebug) log.info(ffmpegLog.join('\n'));
        if (userDebug) log.info('end processVideo', new Date());
        resolve(ffmpegLog);
      })
      .on('error', (err: any) => {
        const errMsg = `An error occurred: ${err}`;
        log.info(errMsg);
        ffmpegLog.push(errMsg);

        if (`${err}`.includes('ffmpeg was killed with signal SIGKILL')) {
          progressCb(airing.object_id, {
            cancelled: true,
            finished: false,
          });
        } else {
          progressCb(airing.object_id, {
            failed: true,
            failedMsg: err,
          });
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
        progressCb(airing.object_id, progress);
      });

    progressCb(airing.object_id, {
      timemark: beginTimemark,
    });

    airing.cmd.run();
    // debug('exportVideo - setting auto kill export');
    // setTimeout(() => cancelExportProcess(airing), 15000);
  });
};
