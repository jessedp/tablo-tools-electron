// @flow
// import ffmpeg from 'ffmpeg-static-electron';
import ffmpeg from 'ffmpeg-static-electron-jdp';

import fs from 'fs';
import * as fsPath from 'path';

import { readableDuration } from './utils';
import { RecDb, ShowDb } from './db';
import Api from './Tablo';
import Show from './Show';

const sanitize = require('sanitize-filename');
// const ffmpeg = require('ffmpeg-static');

const FfmpegCommand = require('fluent-ffmpeg');

const SERIES = 'episode';
const MOVIE = 'movie';
const EVENT = 'event';
const PROGRAM = 'program';

const cmd = new FfmpegCommand();
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

  constructor(data: Object) {
    Object.assign(this, data);
    this.airingDetails = this.airing_details;
    delete this.airing_details;
    this.videoDetails = this.video_details;
    delete this.video_details;
    this.snapshotImage = this.snapshot_image;
    delete this.snapshot_image;
    this.userInfo = this.user_info;
    delete this.user_info;

    // this.show = null;
    this.cachedWatch = null;
  }

  static async create(data: Object) {
    const airing = new Airing(data);

    const docs = await ShowDb.asyncFind({ path: airing.typePath });

    let piece = [];
    switch (airing.type) {
      case SERIES:
        piece = docs[0].series;
        break;
      case MOVIE:
        piece = docs[0].movie;
        break;
      case EVENT:
        piece = docs[0].sport;
        break;
      case PROGRAM:
      default:
        console.log('PROGRAM type - who knows if this will work');
        piece = docs[0].program;
        break;
    }
    airing.show = piece;
    return airing;
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
    return `${dt.toLocaleDateString()}  ${dt.toLocaleTimeString()}`;
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
        return this.program_path;
      default:
        throw new Error('unknown airing type!');
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
    return this.show.background_image.image_id;
  }

  get thumbnail() {
    if (!this.show.thumbnail_image) {
      console.log(this.show);
      return { image_id: 0 };
    }
    return this.show.thumbnail_image.image_id;
  }

  get image() {
    const { snapshotImage } = this;
    if (snapshotImage && snapshotImage.image_id) {
      return snapshotImage.image_id;
    }
    return null;
  }

  get exportFile() {
    const { showTitle } = this;

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
      default:
        console.error('Unknown type exportFile', this);
        // `${outPath}/${this.title}`;
        outPath = fsPath.join(outPath, this.title);
        return outPath;
    }
  }

  get exportPath() {
    const { showTitle } = this;

    // TODO: need to init the config on first startup!
    const config = JSON.parse(localStorage.getItem('AppConfig') || '{}');
    let outPath = '';
    switch (this.type) {
      case SERIES:
        outPath = fsPath.join(
          config.episodePath,
          sanitize(showTitle),
          `Season ${this.seasonNum}`
        );
        return outPath;
      case MOVIE:
        return config.moviePath;
      case EVENT:
        outPath = fsPath.join(config.eventPath, this.showTitle);
        return outPath;
      case PROGRAM:
        return config.exportDataPath;
      default:
        throw new Error('unknown airing type!');
    }
  }

  async watch() {
    if (!this.cachedWatch) {
      const watchPath = `${this.path}/watch`;
      const data = await Api.post({ path: watchPath });
      // TODO: better local/forward rewrites (probably elsewhere)
      if (Api.device.private_ip === '127.0.0.1') {
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
    try {
      await Api.delete(path);
      await RecDb.asyncRemove({ _id });
    } catch (e) {
      console.log('Airing.delete');
      console.log(e);
    }
  }

  cancelVideoProcess() {
    const { _id, path } = this;
    cmd.kill();
    try {
      fs.unlinkSync(outFile);
    } catch (e) {
      console.debug(_id, path, e);
    }
  }

  async processVideo(callback: Function = null) {
    console.log('processVideo');
    console.log('ffmpeg', ffmpeg);
    console.log('ffmpeg.path', ffmpeg.path);

    const ffmpegPath = ffmpeg.path;

    console.log('ffmpegPath', ffmpegPath);
    let ffmpegPath2;
    /** In dev, the prod path gets returned, so "fix" that * */
    // *nix
    ffmpegPath2 = ffmpegPath.replace(
      '/app/',
      '/node_modules/ffmpeg-static-electron-jdp/'
    );

    if (ffmpegPath2 === ffmpegPath) {
      // win
      ffmpegPath2 = ffmpegPath.replace(
        '\\app\\',
        '\\node_modules\\ffmpeg-static-electron-jdp\\'
      );
    }
    console.log('after "app" replacements', ffmpegPath2);

    // $FlowFixMe  dirty, but flow complains about process.resourcesPath
    const resourcePath = `${process.resourcesPath}`;

    const psuedoProdPath = resourcePath.replace(
      '/electron/dist/resources',
      '/ffmpeg-static-electron-jdp/bin'
    );
    console.log('resourcePath', resourcePath);
    console.log('prodPath', psuedoProdPath);

    const ffmpegOpts = [
      '-c copy',
      '-y' // overwrite existing files
    ];

    console.log('env', process.env.NODE_ENV);
    console.log('prodPath exists', fs.existsSync(psuedoProdPath));
    // In true prod (not yarn build/start), ffmpeg is built into resources dir
    if (process.env.NODE_ENV === 'production') {
      const testStartPath = ffmpegPath2.replace(/^[/|\\]bin/, psuedoProdPath);
      if (fs.existsSync(testStartPath)) {
        console.log('START replacing ffmpegPath2 for prodPath', psuedoProdPath);
        ffmpegPath2 = testStartPath;
        console.log('START replaced prodPath for prod', ffmpegPath2);
      } else {
        console.log('PROD replacing ffmpegPath2 for prodPath', psuedoProdPath);
        ffmpegPath2 = psuedoProdPath.replace(
          /[/|\\]resources/,
          `/resources/node_modules/ffmpeg-static-electron-jdp${ffmpegPath}`
        );
        console.log('PROD replaced prodPath for prod', ffmpegPath2);
      }
    } else {
      // otherwise we can hit the node_modules dir
      // ffmpegPath2 = ffmpegPath2.replace(
      //  /^\/bin\//,
      //  './node_modules/ffmpeg-static-electron-jdp/bin/'
      // );
      // verbosity log level
      ffmpegOpts.push('-v 40');
    }

    console.log(`ffmpegPath2 : ${ffmpegPath2}`);

    FfmpegCommand.setFfmpegPath(ffmpegPath2);

    const watchPath = await this.watch();
    const input = watchPath.playlist_url;

    // const input = '/tmp/test_ys_p1.mp4';
    // outFile = '/tmp/test.mp4';

    outFile = this.exportFile;
    const outPath = this.exportPath;

    console.log('exporting to path:', outPath);
    console.log('exporting to file:', outFile);

    fs.mkdirSync(outPath, { recursive: true });

    cmd
      .input(input)
      .output(outFile)
      .addOutputOptions(ffmpegOpts)
      .on('end', () => {
        console.log('Finished processing');
        if (typeof callback === 'function') {
          callback({ finished: true });
        }
      })
      .on('error', err => {
        console.log(`An error occurred: ${err}`);
      })
      .on('stderr', stderrLine => {
        console.log(`Stderr output: ${stderrLine}`);
      })
      .on('progress', progress => {
        if (typeof callback === 'function') {
          callback(progress);
        }
      });

    cmd.run();
  }
}
