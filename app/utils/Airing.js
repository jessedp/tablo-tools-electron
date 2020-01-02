// @flow
import ffmpeg from 'ffmpeg-static';

// import * as FfmpegCommand from 'fluent-ffmpeg';

import fs from 'fs';

import { readableDuration } from './utils';
import { RecDb, ShowDb } from './db';
import Api from './Tablo';
import Show from './Show';

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
    switch (this.type) {
      case SERIES:
        return this.episodeTitle;
      case EVENT:
        return this.eventTitle;
      case MOVIE:
        return this.movieTitle;
      default:
        return '';
    }
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
    const path = this.exportPath;
    let season = '';
    switch (this.type) {
      case SERIES:
        return `${path}/${showTitle}/Season ${this.seasonNum}/${showTitle} - ${this.episodeNum}.${EXT}`;
      case MOVIE:
        return `${path}/${this.title} - ${this.movie_airing.release_year}.${EXT}`;
      case EVENT:
        if (this.event.season) season = `${this.event.season} - `;
        return `${path}/${this.showTitle}/${season}${this.eventTitle}.${EXT}`;
      default:
        console.error('Unknown type exportFile', this);
        return `${path}/${this.title}`;
    }
  }

  get exportPath() {
    const config = JSON.parse(localStorage.getItem('AppConfig'));
    switch (this.type) {
      case SERIES:
        return config.episodePath;
      case MOVIE:
        return config.moviePath;
      case EVENT:
        return config.eventPath;
      case PROGRAM:
        return config.exportDataPath;
      default:
        throw new Error('unknown airing type!');
    }
  }

  async watch() {
    if (!this.cachedWatch) {
      const watchPath = `${this.path}/watch`;
      console.log('Watch Path', watchPath);
      const data = await Api.post({ path: watchPath });
      // TODO: better local/forward rewrites (probably elsewhere)
      if (Api.device.ip === '127.0.0.1') {
        const re = new RegExp(
          '[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}:[0-9]{1,5}'
        );
        data.playlist_url = data.playlist_url.replace(re, '127.0.0.1:8888');
        console.log('Watch data', data);
      }
      this.cachedWatch = data;
      console.log(this.cachedWatch);
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
    // const { _id, path } = this;
    console.log('processVideo');

    console.log(`path : ${ffmpeg.path}`);

    const ffmpegPath1 = ffmpeg.path
      ? ffmpeg.path.replace('app.asar', 'app.asar.unpacked')
      : '';
    const ffmpegPath2 = ffmpegPath1.replace(
      '/dist/',
      '/node_modules/ffmpeg-static/'
    );
    console.log(`ffmpeg path : ${ffmpegPath2}`);
    FfmpegCommand.setFfmpegPath(ffmpegPath2);
    const watchPath = await this.watch();
    console.log(watchPath);
    console.log(watchPath.playlist_url);

    const input = watchPath.playlist_url;
    // const input = '/tmp/test_ys_p1.mp4';
    outFile = '/tmp/test.mp4';
    cmd
      .input(input)
      .output(outFile)
      .addOutputOptions([
        '-c copy',
        // '-f segment',
        // '-segment_time 60',
        // '-segment_wrap 2',
        // '-reset_timestamps 1',
        '-y',
        '-v 40'
      ])
      .on('end', () => {
        console.log('Finished processing');
        if (typeof callback === 'function') {
          callback({ finished: true });
        }
      })
      .on('error', err => {
        console.debug(`An error occurred: ${err}`);
      })
      .on('stderr', stderrLine => {
        console.debug(`Stderr output: ${stderrLine}`);
      })
      .on('progress', progress => {
        console.debug(`Processing: ${progress.percent}% done`);
        if (typeof callback === 'function') {
          callback(progress);
        }
      })
      .run();
  }
}
