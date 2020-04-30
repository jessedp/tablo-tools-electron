// @flow
import { TabloImage, ShowCounts } from '../reducers/types';

export const SERIES = 'episode';
export const MOVIE = 'movie';
export const EVENT = 'event';
export const PROGRAM = 'program';

export default class Show {
  // eslint-disable-next-line camelcase
  object_id: number;

  path: string;

  showCounts: ShowCounts;

  // eslint-disable-next-line camelcase
  show_counts: ShowCounts;

  // eslint-disable-next-line camelcase
  thumbnail_image: TabloImage;

  // eslint-disable-next-line camelcase
  background_image: TabloImage;

  // eslint-disable-next-line camelcase
  cover_image: TabloImage;

  plot: string;

  /** TODO: make these proper types :/ */
  episode: Object;

  series: Object;

  // eslint-disable-next-line camelcase
  series_path: string;

  movie: Object;

  // eslint-disable-next-line camelcase
  movie_path: string;

  event: Object;

  sport: Object;

  // eslint-disable-next-line camelcase
  sport_path: string;

  // eslint-disable-next-line camelcase
  program_path: string;

  // eslint-disable-next-line camelcase
  user_info: Object;

  userInfo: Object;

  constructor(data: Object) {
    Object.assign(this, data);
    this.showCounts = this.show_counts;
    delete this.show_counts;

    this.userInfo = this.user_info;
    delete this.user_info;
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
    return '';
  }

  get title() {
    switch (this.type) {
      case SERIES:
        return this.series.title;
      case EVENT:
        return this.sport.title;
      case MOVIE:
        return this.movie.title;
      default:
        return '';
    }
  }

  get sortableTitle() {
    let { title } = this;
    title = title.toLowerCase().trimLeft();

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

  get background() {
    try {
      switch (this.type) {
        case SERIES:
          return this.series.background_image.image_id;
        case MOVIE:
          return this.movie.background_image.image_id;
        case EVENT:
          return this.sport.background_image.image_id;
        default:
          return 0;
      }
    } catch (e) {
      // console.log(e, this);
      return this.thumbnail;
    }
  }

  get thumbnail() {
    let set = null;
    try {
      switch (this.type) {
        case SERIES:
          set = this.series.thumbnail_image;
          break;
        // return this.series.thumbnail_image.image_id;
        case MOVIE:
          set = this.movie.thumbnail_image;
          break;
        // return this.movie.thumbnail_image.image_id;
        case EVENT:
          set = this.sport.thumbnail_image;
          break;
        case PROGRAM:
          set = this.background_image;
          break;
        default:
          return 0;
      }
      if (!set) return 0;
      return set.image_id;
    } catch (e) {
      // console.error(e, this);
      return 0;
    }
  }

  get cover() {
    try {
      switch (this.type) {
        case SERIES:
          return this.series.cover_image.image_id;
        case MOVIE:
          return this.movie.cover_image.image_id;
        case EVENT:
          return this.sport.cover_image.image_id;
        default:
          return 0;
      }
    } catch (e) {
      // console.error(e, this);
      return this.background;
    }
  }
}
