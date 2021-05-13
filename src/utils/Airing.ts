import fs from 'fs';
import { execSync } from 'child_process';
import * as fsPath from 'path';
import log from 'electron-log';
import {
  asyncForEach,
  readableDuration,
  findFfmpegPath,
  timeStrToSeconds,
} from './utils';
import Show from './Show';
import getConfig from './config';
import {
  EVENT,
  MOVIE,
  PROGRAM,
  SERIES,
  beginTimemark,
  NamingTemplateType,
  DUPE_ADDID,
  DUPE_OVERWRITE,
  DUPE_SKIP,
  DUPE_INC,
} from '../constants/app';
import { buildTemplateVars, getTemplate, fillTemplate } from './namingTpl';

const sanitize = require('sanitize-filename');

// const ffmpeg = require('ffmpeg-static');
const FfmpegCommand = require('fluent-ffmpeg');

let outFile = '';
export default class Airing {
  episode!: Record<string, any>;

  // eslint-disable-next-line camelcase
  object_id!: number;

  // eslint-disable-next-line camelcase
  airing_details?: Record<string, any>;

  airingDetails!: Record<string, any>;

  // eslint-disable-next-line camelcase
  video_details?: Record<string, any>;

  videoDetails!: Record<string, any>;

  // eslint-disable-next-line camelcase
  snapshot_image?: Record<string, any>;

  snapshotImage!: Record<string, any>;

  // eslint-disable-next-line camelcase
  user_info?: Record<string, any>;

  userInfo!: Record<string, any>;

  show!: Show;

  cachedWatch?: Record<string, any>;

  path!: string;

  // eslint-disable-next-line camelcase
  _id!: string;

  event!: Record<string, any>;

  // eslint-disable-next-line camelcase
  movie_airing!: Record<string, any>;

  // eslint-disable-next-line camelcase
  program_path!: string;

  // eslint-disable-next-line camelcase
  sport_path!: string;

  // eslint-disable-next-line camelcase
  movie_path!: string;

  // eslint-disable-next-line camelcase
  event_path!: string;

  // eslint-disable-next-line camelcase
  series_path!: string;

  cmd: any;

  data!: Record<string, any>;

  customTemplate?: NamingTemplateType;

  constructor(data: Record<string, any>, retainData = true) {
    Object.assign(this, data);
    // these are always true
    if (this.airing_details) {
      this.airingDetails = this.airing_details;
    }
    delete this.airing_details;
    if (this.video_details) {
      this.videoDetails = this.video_details;
    }
    delete this.video_details;
    if (this.snapshot_image) {
      this.snapshotImage = this.snapshot_image;
    }
    delete this.snapshot_image;
    if (this.user_info) {
      this.userInfo = this.user_info;
    }
    delete this.user_info;

    // this.cachedWatch = null;
    // this.customTemplate = null;
    if (retainData) this.data = data;
  }

  static async find(id: number): Promise<Airing> {
    return Airing.create(
      await global.RecDb.asyncFindOne({
        object_id: id,
      })
    );
  }

  static async create(
    data: Record<string, any>,
    retainData = true
  ): Promise<Airing> {
    if (data) {
      const airing = new Airing(data, retainData);
      const path = airing.typePath;
      const showData = await global.ShowDb.asyncFindOne({
        path,
      });
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
    switch (this.type) {
      case SERIES:
        return `${this.episode.description}`;
      case EVENT:
        return `${this.event.description}`;
      case MOVIE:
        return `${this.show.description}`;
      default:
        return '';
    }
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
    if (this.isEpisode) {
      const { episode } = this;
      return `s${this.seasonNum}e${episode.number.toString().padStart(2, '0')}`;
    }
    return 's00e00';
  }

  get seasonNum() {
    if (this.isEpisode) {
      const { episode } = this;
      return episode.season_number.toString().padStart(2, '0');
    }
    return '00';
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

  /**
   * Try to get the Show record's background image, then fallback on the individual airing's image
   * @return {number} an image number to pass to the Tablo server's image url
   */
  get background() {
    const { show } = this;
    return (show && show.background) || this.image;
  }

  /**
   * Try to get the Show record's thumbnail image, then fallback on the individual airing's image
   * @return {number} an image number to pass to the Tablo server's image url
   */
  get thumbnail(): number {
    const { show } = this;
    return (show && show.thumbnail) || this.image;
  }

  /**
   * Return the Snapshot image, then fall back on the Show record's cover or background, then nothing
   * @return {number} an image number to pass to the Tablo server's image url
   */

  get image() {
    const { snapshotImage } = this;

    if (snapshotImage && snapshotImage.image_id) {
      return snapshotImage.image_id;
    }

    const { show } = this;

    if (show) {
      return show.cover || show.background;
    }

    return 0;
  }

  get template() {
    return this.customTemplate ? this.customTemplate : getTemplate(this.type);
  }

  set template(template: NamingTemplateType) {
    this.customTemplate = template;
    this.cachedExportFile = '';
  }

  cachedExportFile!: string;

  // TODO: Cache this somehow?
  get exportFile() {
    if (!this.cachedExportFile) {
      const vars = buildTemplateVars(this);
      this.cachedExportFile = fillTemplate(this.template, vars);
    }

    return this.cachedExportFile;
  }

  cachedDedupedExportFile = '';

  // TODO: Cache this somehow?
  dedupedExportFile(actionOnDuplicate: string = getConfig().actionOnDuplicate) {
    const { exportFile } = this;

    if (
      !fs.existsSync(exportFile) ||
      actionOnDuplicate === DUPE_OVERWRITE ||
      actionOnDuplicate === DUPE_SKIP
    ) {
      return exportFile;
    }

    const parsed = fsPath.parse(exportFile);

    if (actionOnDuplicate === DUPE_ADDID) {
      return fsPath.join(parsed.dir, `${parsed.name}-${this.id}${parsed.ext}`);
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

    console.log('DEFAULT', exportFile);
    return exportFile;
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { _id, path } = this;
    // eslint-disable-next-line compat/compat
    return new Promise((resolve, reject) => {
      try {
        if (process.env.NODE_ENV === 'production') {
          global.Api.delete(path);
        }

        global.RecDb.asyncRemove({
          // eslint-disable-next-line @typescript-eslint/naming-convention
          _id,
        });

        if (this.show && this.show.showCounts) {
          if (this.show.showCounts.airing_count === 1) {
            global.ShowDb.asyncRemove({
              object_id: this.show.id,
            });
          } else {
            global.ShowDb.asyncUpdate(
              {
                object_id: this.show.id,
              },
              {
                $set: {
                  'show_counts.airing_count':
                    this.show.showCounts.airing_count - 1,
                },
              }
            );
          }
        }

        setTimeout(() => resolve(true), 300 + 300 * Math.random());
      } catch (e) {
        console.log('Airing.delete', e);
        reject(new Error(`Unable to delete ${this.object_id} - ${e}`));
      }
    });
  }

  cancelVideoProcess() {
    // eslint-disable-next-line @typescript-eslint/naming-convention
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

  getExportDetails(): string {
    const { exportFile } = this;
    if (!fs.existsSync(exportFile)) return '';
    // this is janky becuase it should be using ffprobe, but
    // I don't want to package it, too. So ffmpeg throws an
    // warning in the logs and the last line output is
    const lastLine = 'At least one output file must be specified';
    const firstLine = /^Error: Command failed:(.*)/;
    const ffmpeg = findFfmpegPath();
    let info;

    try {
      info = execSync(`${ffmpeg} -i "${exportFile}"`);
    } catch (e) {
      console.log(e);
      info = e.toString();
    }

    info = info.toString().trim();
    return info.replace(firstLine, '').replace(lastLine, '');
  }

  isExportValid(): {
    valid: boolean;
    reason?: string;
  } {
    const { exportFile, videoDetails } = this;
    if (!fs.existsSync(exportFile))
      return {
        valid: false,
        reason: 'No exported file found.',
      };
    const info = this.getExportDetails();
    // Duration: 01:01:16.16,
    const durRe = /Duration: ([0-9:]*)/;
    const matches = info.match(durRe);
    if (!matches)
      return {
        valid: false,
        reason: 'No exported file found.',
      };
    const realSec = timeStrToSeconds(matches[1]);
    const thisSec = videoDetails.duration;
    const threshold = 20;
    if (realSec + threshold < thisSec)
      return {
        valid: false,
        reason: `Exported (${realSec}) duration is less than expected (${this.actualDuration}) by more than ${threshold} seconds`,
      };
    return {
      valid: true,
    };
  }

  // async processVideo(
  async processVideo(
    actionOnDuplicate: string = getConfig().actionOnDuplicate,
    progressCallback: (...args: Array<any>) => any
  ) {
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
    FfmpegCommand.setFfmpegPath(findFfmpegPath(debug, log));
    let watchPath: Record<string, any> | undefined;
    let input = '';

    try {
      watchPath = await this.watch();
      if (!watchPath)
        throw new Error('watchPath undefined after calling watch()');

      input = watchPath.playlist_url;
    } catch (err) {
      log.warn(`An error occurred: ${err}`);

      if (typeof progressCallback === 'function') {
        progressCallback(this.object_id, {
          failed: true,
          failedMsg: err,
        });
      }
      // FIXME: not sure what this does...
      return () => undefined;
    }

    outFile = this.dedupedExportFile();
    console.log('outFile', outFile);
    const outPath = fsPath.dirname(outFile);
    if (debug) log.info('exporting to path:', outPath);
    if (debug) log.info('exporting to file:', outFile);
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

    // eslint-disable-next-line compat/compat
    return new Promise((resolve) => {
      if (outFile !== this.exportFile) {
        if (actionOnDuplicate === DUPE_SKIP) {
          progressCallback(this.object_id, {
            skipped: true,
            finished: true,
          });
          resolve('dupe skip');
        }
      }

      const ffmpegLog: Array<string> = [];
      let record = true;
      this.cmd = new FfmpegCommand();
      this.cmd
        .input(input)
        .output(outFile)
        .addOutputOptions(ffmpegOpts)
        .on('end', () => {
          // log.info('Finished processing');
          if (typeof progressCallback === 'function') {
            progressCallback(this.object_id, {
              finished: true,
              log: ffmpegLog,
            });
          }

          if (debug) log.info(ffmpegLog.join('\n'));
          if (debug) log.info('end processVideo', new Date());
          resolve(ffmpegLog);
        })
        .on('error', (err: any) => {
          const errMsg = `An error occurred: ${err}`;
          log.info(errMsg);
          ffmpegLog.push(errMsg);

          if (typeof progressCallback === 'function') {
            if (`${err}`.includes('ffmpeg was killed with signal SIGKILL')) {
              progressCallback(this.object_id, {
                cancelled: true,
                finished: false,
              });
            } else {
              progressCallback(this.object_id, {
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
        .on('progress', (progress: Record<string, any>) => {
          if (typeof progressCallback === 'function') {
            progressCallback(this.object_id, progress);
          }
        });

      if (typeof progressCallback === 'function') {
        progressCallback(this.object_id, {
          timemark: beginTimemark,
        });
      }

      this.cmd.run();
    });
  }
}

export function ensureAiringArray(list: Array<any>) {
  if (!list || !Array.isArray(list)) return [];
  const ret: Array<Airing> = [];
  asyncForEach(list, async (item) => {
    if (item instanceof Airing && item.airingDetails) ret.push(item);
    ret.push(await Airing.find(item.object_id));
  });
  return ret;
}

export const getEpisodesByShow = async (show: Show): Promise<Array<Airing>> => {
  let recs = [];

  switch (show.type) {
    case SERIES:
      recs = await global.RecDb.asyncFind({
        series_path: show.path,
      });
      break;

    case EVENT:
      recs = await global.RecDb.asyncFind({
        sport_path: show.path,
      });
      break;

    case MOVIE:
      recs = await global.RecDb.asyncFind({
        movie_path: show.path,
      });
      break;

    case PROGRAM:
    default:
      // manual? would be path files above don't
      return [];
  }

  const airings: Array<Airing> = [];
  await asyncForEach(recs, async (rec: Record<string, any>) => {
    const airing = await Airing.create(rec);
    airings.push(airing);
  });
  return airings;
};
