// @flow

export const SERIES = 'episode';
export const MOVIE = 'movie';
export const EVENT = 'event';
export const PROGRAM = 'program';

export default class Show {
  constructor(data) {
    Object.assign(this, data);
    this.showCounts = this.show_counts;
    delete this.show_counts;

    this.userInfo = this.user_info;
    delete this.user_info;
  }

  static create(data) {
    const airing = new Show(data);

    // const docs = await ShowDb.asyncFind( { 'path': airing.typePath });

    // Slow and now batch, so do this later when we actually need it
    // For now.
    // await airing.watch();
    /**
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
        */
    return airing;
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
  }

  get thumbnail() {
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
  }

  get cover() {
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
  }
}
