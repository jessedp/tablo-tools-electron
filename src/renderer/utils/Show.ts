// @flow
import { ShowCounts } from './types';

import { EVENT, MOVIE, SERIES } from '../constants/app';

export default class Show {
  // eslint-disable-next-line camelcase
  object_id!: number;

  path!: string;

  // TODO: Series, Movie,  type
  series!: Record<string, any>;

  movie!: Record<string, any>;

  sport!: Record<string, any>;

  showCounts!: ShowCounts;

  // eslint-disable-next-line camelcase
  show_counts?: ShowCounts;

  // eslint-disable-next-line camelcase
  user_info?: Record<string, any>;

  userInfo!: Record<string, any>;

  keep!: { rule: string; count?: number };

  guide_path?: string;

  constructor(data: Record<string, any>) {
    Object.assign(this, data);
    // always true...
    if (this.show_counts) {
      this.showCounts = this.show_counts;
      delete this.show_counts;
    }
    // always true...
    if (this.user_info) {
      this.userInfo = this.user_info;
      delete this.user_info;
    }
  }

  get id() {
    return this.object_id;
  }

  get description() {
    switch (this.type) {
      case SERIES:
        return `${this.series.description}`;
      case EVENT:
        return `${this.sport.description}`;
      case MOVIE:
        return `${this.movie.plot}`;
      default:
        return '';
    }
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
    const words = title.split(' ');

    if (words.length === 1) {
      if (/^\d(.*)/.test(title)) {
        title = `zzz ${title}`;
      }

      return title;
    }

    // console.log(words[0].toLowerCase());
    // if (words[0].toLowerCase() in articles){
    if (articles.includes(words[0])) {
      words.shift();
      title = words.join(' ');
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

  get isEpisode() {
    return this.type === SERIES;
  }

  get isEvent() {
    return this.type === EVENT;
  }

  get isMovie() {
    return this.type === MOVIE;
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
      return this.background;
    }
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
      return this.thumbnail;
    }
  }

  get thumbnail() {
    try {
      switch (this.type) {
        case SERIES:
          return this.series.thumbnail_image.image_id;
        case MOVIE:
          return this.movie.thumbnail_image.image_id;
        case EVENT:
          return this.sport.thumbnail_image.image_id;
        default:
          return 0;
      }
    } catch (e) {
      return 0;
    }
  }
}
