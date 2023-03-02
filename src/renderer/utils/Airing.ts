import Debug from 'debug';

import sanitize from 'sanitize-filename';

import Device from 'tablo-api/dist/src/Device';
import {
  asyncForEach,
  readableDuration,
  sendError,
  timeStrToSeconds,
} from './utils';

import Show from './Show';

import { EVENT, MOVIE, PROGRAM, SERIES } from '../constants/app';

import { NamingTemplateType } from '../constants/types';

import { buildTemplateVars, getTemplate, fillTemplate } from './namingTpl';

const debug = Debug('tablo-tools:Airing');
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
  // cmd: typeof Ffmpeg.FfmpegCommand;
  // cmd: Ffmpeg.FfmpegCommand;

  data: Record<string, any>;

  customTemplate?: NamingTemplateType;

  constructor(data: Record<string, any>, retainData = true) {
    // this.cmd = FfmpegCommand();

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

    this.data = {};
    if (retainData) {
      // Make a copy or else a non-extensible object is thrown in create() when trying to add show
      this.data = { ...data, ...{} };
    }
  }

  static async find(id: number): Promise<Airing> {
    // const { promisify } = require('util');

    // let data: any;
    // const count = promisify(global.RecDb.count);
    // console.log('Count/promisify  =', await count({}));

    // console.log({}, (err: any, res: any) => {
    //   if (err) console.log('err: ', err);
    //   console.log('count: ', res);
    //   data = res;
    //   return res;
    // });
    // console.log('COUNT: ', data);
    // global.RecDb.findOne(
    //   {
    //     object_id: id,
    //   },
    //   (err: any, res: any) => {
    //     if (err) console.log('err: ', err);
    //     console.log('data: ', res);
    //     data = res;
    //     return res;
    //   }
    // );

    // console.log('data: - ', data);
    // return Airing.create(
    //   data
    //   // await window.db.findOneAsync('RecDb', {
    //   //   object_id: id,
    //   // })
    // );
    let data = {};
    if (typeof window === 'undefined') {
      data = await global.dbs.RecDb.findOneAsync({
        object_id: id,
      });
    } else {
      data = await window.db.findOneAsync('RecDb', {
        object_id: id,
      });
    }

    return Airing.create(data);
    // await window.db.findOneAsync('RecDb', {
    //   object_id: id,
    // })
    // );
  }

  static async create(
    data: Record<string, any>,
    retainData = true
  ): Promise<Airing> {
    if (data) {
      const airing = new Airing(data, retainData);
      const path = airing.typePath;
      let showData = {};

      if (typeof window === 'undefined') {
        showData = await global.dbs.RecDb.findOneAsync('ShowDb', {
          path,
        });
      } else {
        showData = await window.db.findOneAsync('ShowDb', {
          path,
        });
      }
      airing.show = new Show(showData);
      if (retainData)
        Object.defineProperty(airing.data, 'show', { value: showData });
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

      default: {
        const err = new Error(
          `unknown airing type! Type = ${this.type} , This: ${JSON.stringify(
            this,
            null,
            2
          )}`
        );
        sendError(err);
        return '';
      }
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

  cachedDedupedExportFile = '';

  // TODO: Cache this somehow?
  get exportFile() {
    // debug('Airing - exportFile: ', this.cachedExportFile);
    if (!this.cachedExportFile) {
      const vars = buildTemplateVars(this);
      debug('Airing - template: ', this.template);
      debug('Airing - vars: ', vars);
      this.cachedExportFile = fillTemplate(this.template, vars);
    }

    return this.cachedExportFile;
  }

  async watch() {
    if (!this.cachedWatch) {
      const watchPath = `${this.path}/watch`;

      let data;

      try {
        if (typeof window === 'undefined') {
          data = await globalThis.Api.post(watchPath);
        } else {
          data = await window.Tablo.post(watchPath);
        }
      } catch (e) {
        console.warn(`Unable to load ${watchPath}`, e);
        throw e;
      }

      // TODO: better local/forward rewrites (probably elsewhere)
      let device: Device;
      if (typeof window === 'undefined') {
        device = await globalThis.Api.device;
      } else {
        device = await window.Tablo.device();
      }

      if (device.private_ip === '127.0.0.1') {
        const re = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}:[0-9]{1,5}/;
        data.playlist_url = data.playlist_url.replace(re, '127.0.0.1:8888');
      }

      this.cachedWatch = data;
    }

    return this.cachedWatch;
  }

  async delete() {
    const { _id, path } = this;
    console.log(`Airing.delete - ${_id} - ${path}`);

    return new Promise((resolve, reject) => {
      try {
        if (process.env.NODE_ENV === 'production') {
          window.Tablo.delete(path);
        }

        window.db.removeAsync('RecDb', {
          _id,
        });

        if (this.show && this.show.showCounts) {
          if (this.show.showCounts.airing_count === 1) {
            window.db.removeAsync('ShowDb', {
              object_id: this.show.id,
            });
          } else {
            window.db.updateAsync(
              'ShowDb',
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

  async setProtected(protect = true) {
    try {
      if (typeof window === 'undefined') {
        await globalThis.Api.patch(this.path, { protected: protect });
      } else {
        await window.Tablo.patch(this.path, { protected: protect });
      }
      window.db.updateAsync(
        'RecDb',
        {
          object_id: this.id,
        },
        {
          $set: {
            'user_info.protected': protect,
          },
        }
      );
    } catch (e) {
      console.log('Airing.setProtected', e);
      return false;
    }
    return true;
  }

  async setWatched(watched = true) {
    try {
      if (typeof window === 'undefined') {
        await globalThis.Api.patch(this.path, { watched });
      } else {
        await window.Tablo.patch(this.path, { watched });
      }
      window.db.updateAsync(
        'RecDb',
        {
          object_id: this.id,
        },
        {
          $set: {
            'user_info.watched': watched,
          },
        }
      );
    } catch (e) {
      console.log('Airing.setWatched', e);
      return false;
    }
    return true;
  }

  getExportDetails() {
    return window.Airing.getExportDetails(this);
  }

  isExportValid(): {
    valid: boolean;
    reason?: string;
  } {
    const { exportFile, videoDetails } = this;
    if (!window.fs.existsSync(exportFile))
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
      recs = await window.db.findAsync('RecDb', {
        series_path: show.path,
      });
      break;

    case EVENT:
      recs = await window.db.findAsync('RecDb', {
        sport_path: show.path,
      });
      break;

    case MOVIE:
      recs = await window.db.findAsync('RecDb', {
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
