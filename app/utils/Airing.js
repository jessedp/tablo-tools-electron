// @flow
// import ffmpeg from 'ffmpeg-static-electron';
import ffmpeg from 'ffmpeg-static-electron-jdp';

import os from 'os';
import fs from 'fs';
import * as fsPath from 'path';
import log from 'electron-log';

import { asyncForEach, readableDuration } from './utils';

import Show from './Show';
import getConfig from './config';
import { EVENT, MOVIE, PROGRAM, SERIES, beginTimemark } from '../constants/app';
import {
  buildTemplateVars,
  getDefaultTemplate,
  fillTemplate
} from './namingTpl';

const sanitize = require('sanitize-filename');
// const ffmpeg = require('ffmpeg-static');

const FfmpegCommand = require('fluent-ffmpeg');

let outFile = '';

export default class Airing {
  episode: Object;

  // eslint-disable-next-line camelcase
  object_id: number;

  // eslint-disable-next-line camelcase
  airing_details: Object;

  airingDetails: Object;

  // eslint-disable-next-line camelcase
  video_details: Object;

  videoDetails: Object;

  // eslint-disable-next-line camelcase
  snapshot_image: Object;

  snapshotImage: Object;

  // eslint-disable-next-line camelcase
  user_info: Object;

  userInfo: Object;

  show: Show;

  cachedWatch: Object;

  path: string;

  _id: number;

  event: Object;

  // eslint-disable-next-line camelcase
  movie_airing: Object;

  // eslint-disable-next-line camelcase
  program_path: string;

  // eslint-disable-next-line camelcase
  sport_path: string;

  // eslint-disable-next-line camelcase
  movie_path: string;

  // eslint-disable-next-line camelcase
  event_path: string;

  // eslint-disable-next-line camelcase
  series_path: string;

  cmd: any;

  data: Object;

  constructor(data: Object, retainData: boolean = true) {
    Object.assign(this, data);
    this.airingDetails = this.airing_details;
    delete this.airing_details;
    this.videoDetails = this.video_details;
    delete this.video_details;
    this.snapshotImage = this.snapshot_image;
    delete this.snapshot_image;
    this.userInfo = this.user_info;
    delete this.user_info;

    this.cachedWatch = null;

    if (retainData) this.data = data;
  }

  static async find(id: number): Promise<Airing> {
    return Airing.create(await global.RecDb.asyncFindOne({ object_id: id }));
  }

  static async create(
    data: Object,
    retainData: boolean = true
  ): Promise<Airing> {
    if (data) {
      const airing = new Airing(data, retainData);
      const path = airing.typePath;
      const showData = await global.ShowDb.asyncFindOne({ path });
      airing.show = new Show(showData);
      if (retainData) airing.data.show = showData;
      return airing;
    }

    console.warn('Airing.create: no data');
    return new Airing({});
  }

  get id() {
    return this.object_id;
  }

  get description() {
    if (this.isEpisode) {
      return `${this.episode.description}`;
    }
    if (this.isEvent) {
      return `${this.event.description}`;
    }
    if (this.isMovie) {
      return `${this.show.plot}`;
    }
    return '';
  }

  get datetime() {
    const { airingDetails } = this;
    const dt = new Date(airingDetails.datetime);
    const str = `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
    return str.replace(/:00\s/, ' ');
  }

  get showTitle() {
    const { airingDetails } = this;
    return airingDetails.show_title;
  }

  get title() {
    let retVal;
    switch (this.type) {
      case SERIES:
        retVal = this.episodeTitle;
        break;
      case EVENT:
        retVal = this.eventTitle;
        break;
      case MOVIE:
        retVal = this.movieTitle;
        break;
      case PROGRAM:
        retVal = this.showTitle;
        break;
      default:
        retVal = '';
    }
    return sanitize(retVal);
  }

  get eventTitle() {
    const { event } = this;
    return event.title;
  }

  get movieTitle() {
    return this.showTitle;
  }

  get episodeTitle() {
    const { episode, airingDetails } = this;
    let { title } = episode;
    if (!title) {
      // This gem brought to you by Buzzr, Celebrity Name Game, and/or
      // maybe TMSIDs that start with "SH"
      if (episode.season_number === 0 && episode.number === 0) {
        title = airingDetails.datetime.replace(/[-:Z]/g, '').replace('T', '_');
      } else {
        title = this.episodeNum;
      }
      return title;
    }
    // yuck - "105" = season 1 + episode 5
    // console.log(episode.number);
    if (
      title ===
      `${episode.season_number}${episode.number.toString().padStart(2, '0')}`
    ) {
      return this.episodeNum;
    }
    return title;
  }

  get episodeNum() {
    const { episode } = this;
    return `s${this.seasonNum}e${episode.number.toString().padStart(2, '0')}`;
  }

  get seasonNum() {
    const { episode } = this;
    return episode.season_number.toString().padStart(2, '0');
  }

  get duration() {
    const { airingDetails } = this;
    return readableDuration(airingDetails.duration);
  }

  get actualDuration() {
    const { videoDetails } = this;
    return readableDuration(videoDetails.duration);
  }

  get type() {
    // maybe make the regex match the const?
    if (/series/.test(this.path)) {
      return SERIES;
    }
    if (/movies/.test(this.path)) {
      return MOVIE;
    }
    if (/sports/.test(this.path)) {
      return EVENT;
    }
    if (/programs/.test(this.path)) {
      return PROGRAM;
    }
    return `unknown : ${this.path}`;
  }

  get typePath() {
    switch (this.type) {
      case SERIES:
        return this.series_path;
      case MOVIE:
        return this.movie_path;
      case EVENT:
        return this.sport_path;
      case PROGRAM:
        return '';
      default:
        throw new Error(`unknown airing type! ${this.type}`);
    }
  }

  get isEpisode() {
    return this.type === SERIES;
  }

  get isEvent() {
    return this.type === EVENT;
  }

  get isMovie() {
    return this.type === MOVIE;
  }

  get background() {
    if (!this.show.background) {
      return this.image;
    }
    return this.show.background;
  }

  get thumbnail(): number {
    if (!this.show.thumbnail) {
      return this.image;
    }
    return this.show.thumbnail;
  }

  // Just cycle through most to least specific...
  get image() {
    const { snapshotImage } = this;
    if (snapshotImage && snapshotImage.image_id) {
      return snapshotImage.image_id;
    }
    const { show } = this;
    if (show) {
      return show.cover;
    }
    return 0;
  }

  exportFile = () => {
    const vars = buildTemplateVars(this);
    console.log(fillTemplate(getDefaultTemplate(this.type), vars));
    // return 'file placeholder';
    return fillTemplate(getDefaultTemplate(this.type), vars);
  };

  get exportFileOrig() {
    const { showTitle, airingDetails } = this;

    const EXT = 'mp4';
    let outPath = this.exportPath;
    let season = '';
    switch (this.type) {
      case SERIES:
        // `${outPath}/${showTitle}/Season ${this.seasonNum}/${showTitle} - ${this.episodeNum}.${EXT}`;
        outPath = fsPath.join(
          outPath,
          `${sanitize(showTitle)} - ${this.episodeNum}.${EXT}`
        );
        return outPath;
      case MOVIE:
        // `${outPath}/${this.title} - ${this.movie_airing.release_year}.${EXT}`;
        outPath = fsPath.join(
          outPath,
          `${this.title} - ${this.movie_airing.release_year}.${EXT}`
        );
        return outPath;
      case EVENT:
        if (this.event.season) season = `${this.event.season} - `;
        // `${outPath}/${this.showTitle}/${season}${this.eventTitle}.${EXT}`;
        outPath = fsPath.join(outPath, `${season}${this.title}.${EXT}`);
        return outPath;
      case PROGRAM:
        // eslint-disable-next-line no-case-declarations
        const datetime = airingDetails.datetime
          .replace(/[-:Z]/g, '')
          .replace('T', '_');
        outPath = fsPath.join(outPath, `${this.title}-${datetime}.${EXT}`);
        return outPath;
      default:
        console.error('Unknown type exportFile', this.type, this);
        throw Error('Unknown type exportFile');
    }
  }

  get exportPath() {
    const { showTitle } = this;

    // TODO: need to init the config on first startup!
    const config = getConfig();
    let outPath = '';
    switch (this.type) {
      case MOVIE:
        outPath = fsPath.join(config.moviePath, sanitize(showTitle));
        return outPath;
      case EVENT:
        outPath = fsPath.join(config.eventPath, sanitize(showTitle));
        return outPath;
      case SERIES:
        outPath = fsPath.join(
          config.episodePath,
          sanitize(showTitle),
          `Season ${this.seasonNum}`
        );
        return outPath;
      case PROGRAM:
        outPath = config.programPath;
        return outPath;
      default:
        throw new Error('unknown airing type!');
    }
  }

  async watch() {
    if (!this.cachedWatch) {
      const watchPath = `${this.path}/watch`;
      let data;
      try {
        data = await global.Api.post(watchPath);
      } catch (e) {
        console.warn(`Unable to load ${watchPath}`, e);
        throw new Error(e);
      }
      // TODO: better local/forward rewrites (probably elsewhere)
      if (global.Api.device.private_ip === '127.0.0.1') {
        const re = new RegExp(
          '[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}:[0-9]{1,5}'
        );
        data.playlist_url = data.playlist_url.replace(re, '127.0.0.1:8888');
      }
      this.cachedWatch = data;
    }
    return this.cachedWatch;
  }

  async delete() {
    const { _id, path } = this;
    return new Promise((resolve, reject) => {
      try {
        global.Api.delete(path);
        global.RecDb.asyncRemove({ _id });
        setTimeout(() => resolve(true), 300 + 300 * Math.random());
      } catch (e) {
        console.log('Airing.delete', e);
        reject(new Error(`Unable to delete ${this.object_id} - ${e}`));
      }
    });
  }

  cancelVideoProcess() {
    const { _id, path } = this;
    // this is to be clean while Mac doesn't work
    if (!this.cmd) {
      console.warn('No cmd process exists while canceling!');
      return;
    }

    this.cmd.kill();

    try {
      fs.unlinkSync(outFile);
    } catch (e) {
      console.debug(_id, path, e);
    }
  }

  async processVideo(callback: Function = null) {
    const debug = getConfig().enableDebug;
    let date = new Date()
      .toISOString()
      .replace('T', '_')
      .replace(/:/g, '-')
      .replace(/ /g, '_');

    date = date.substr(0, date.indexOf('.'));
    log.transports.file.fileName = `${this.object_id}-${sanitize(
      this.showTitle
    )}-${date}.log`;
    log.transports.file.maxSize = 1048576; // 1mb
    if (!debug) {
      log.transports.file.level = false;
    }

    if (debug) log.info('start processVideo', new Date());
    if (debug) log.info('env', process.env.NODE_ENV);

    const ffmpegPath = ffmpeg.path;
    if (debug) log.info('ffmpegPath', ffmpegPath);

    // $FlowFixMe  dirty, but flow complains about process.resourcesPath
    const resourcePath = `${process.resourcesPath}`;

    // TODO - figure out why I did this...
    const psuedoProdPath = resourcePath.replace(
      '/electron/dist/resources',
      '/ffmpeg-static-electron-jdp/bin'
    );
    if (debug) log.info('resourcePath', resourcePath);
    if (debug) log.info('prodPath', psuedoProdPath);

    let ffmpegPathReal = ffmpegPath;

    /** In dev, the prod path gets returned, so "fix" that * */
    if (process.env.NODE_ENV === 'development') {
      if (os.platform() === 'win') {
        if (ffmpegPathReal === ffmpegPath) {
          ffmpegPathReal = ffmpegPath.replace(
            '\\app\\',
            '\\node_modules\\ffmpeg-static-electron-jdp\\'
          );
        }
      } else {
        // *nix
        ffmpegPathReal = ffmpegPath.replace(
          '/app/',
          '/node_modules/ffmpeg-static-electron-jdp/'
        );
      }
    }

    if (debug) log.info('after "app" replacements for dev', ffmpegPathReal);

    const ffmpegOpts = [
      '-c copy',
      '-y' // overwrite existing files
    ];

    if (debug) log.info('prodPath exists', fs.existsSync(psuedoProdPath));
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
          if (debug)
            log.info(
              'START replacing ffmpegPathReal for prodPath',
              psuedoProdPath
            );
          ffmpegPathReal = testStartPath;
          if (debug)
            log.info('START replaced prodPath for prod', ffmpegPathReal);
        } else {
          if (debug)
            log.info(
              'PROD replacing ffmpegPathReal for prodPath',
              psuedoProdPath
            );
          ffmpegPathReal = psuedoProdPath.replace(
            /[/|\\]resources/,
            `/resources/node_modules/ffmpeg-static-electron-jdp${ffmpegPath}`
          );
          if (debug)
            log.info('PROD replaced prodPath for prod', ffmpegPathReal);
        }
      }
    } else {
      // otherwise we can hit the node_modules dir
      // ffmpegPathReal = ffmpegPathReal.replace(
      //  /^\/bin\//,
      //  './node_modules/ffmpeg-static-electron-jdp/bin/'
      // );
      // verbosity log level
      ffmpegOpts.push('-v 40');
    }

    if (debug) log.info(`ffmpegPathReal : ${ffmpegPathReal}`);

    FfmpegCommand.setFfmpegPath(ffmpegPathReal);

    let watchPath;
    let input;
    try {
      watchPath = await this.watch();
      input = watchPath.playlist_url;
    } catch (err) {
      log.warn(`An error occurred: ${err}`);
      if (typeof callback === 'function') {
        callback(this.object_id, { failed: true, failedMsg: err });
      }
      return;
    }

    // const input = '/tmp/test_ys_p1.mp4';
    // outFile = '/tmp/test.mp4';

    outFile = await this.exportFile();
    const outPath = fsPath.dirname(outFile);

    if (debug) log.info('exporting to path:', outPath);
    if (debug) log.info('exporting to file:', outFile);

    fs.mkdirSync(outPath, { recursive: true });

    return new Promise(resolve => {
      const ffmpegLog = [];
      let record = true;
      this.cmd = new FfmpegCommand();
      this.cmd
        .input(input)
        .output(outFile)
        .addOutputOptions(ffmpegOpts)
        .on('end', () => {
          // log.info('Finished processing');
          if (typeof callback === 'function') {
            callback(this.object_id, { finished: true, log: ffmpegLog });
          }
          if (debug) log.info('result', ffmpegLog);
          if (debug) log.info('end processVideo', new Date());

          resolve(ffmpegLog);
        })
        .on('error', err => {
          log.info(`An error occurred: ${err}`);
          if (typeof callback === 'function') {
            if (`${err}`.includes('ffmpeg was killed with signal SIGKILL')) {
              callback(this.object_id, { cancelled: true, finished: false });
            } else {
              callback(this.object_id, { failed: true, failedMsg: err });
            }
          }
          // reject(err);
          resolve(ffmpegLog);
        })
        .on('stderr', stderrLine => {
          if (
            !stderrLine.includes('EXT-X-PROGRAM-DATE-TIME') &&
            !stderrLine.includes('hls @') &&
            !stderrLine.includes('tcp @') &&
            !stderrLine.includes('AVIOContext') &&
            !stderrLine.includes('Non-monotonous DTS') &&
            !stderrLine.includes('frame=')
          ) {
            // record from start until this...
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
            if (debug) log.info(`Stderr output: ${stderrLine}`);
          }
        })
        .on('progress', progress => {
          if (typeof callback === 'function') {
            callback(this.object_id, progress);
          }
        });

      if (typeof callback === 'function') {
        callback(this.object_id, { timemark: beginTimemark });
      }
      this.cmd.run();
    });
  }
}

export function ensureAiringArray(list: Array<any>) {
  if (!list || !Array.isArray(list)) return [];

  const ret = [];
  asyncForEach(list, async item => {
    if (item instanceof Airing && item.airingDetails) ret.push(item);
    ret.push(await Airing.find(item.object_id));
  });

  return ret;
}

export const getEpisodesByShow = async (show: Show): Promise<Array<Airing>> => {
  let recs = [];
  switch (show.type) {
    case SERIES:
      recs = await global.RecDb.asyncFind({ series_path: show.path });
      break;
    case EVENT:
      recs = await global.RecDb.asyncFind({ sport_path: show.path });
      break;
    case MOVIE:
      recs = await global.RecDb.asyncFind({ movie_path: show.path });
      break;
    case PROGRAM:
    default:
      // manual? would be path files above don't
      return [];
  }

  const airings = [];
  await asyncForEach(recs, async rec => {
    const airing = await Airing.create(rec);
    airings.push(airing);
  });

  return airings;
};
