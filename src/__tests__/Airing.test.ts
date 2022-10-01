import sanitize from 'sanitize-filename';
import Airing from '../renderer/utils/Airing';

import * as seriesData from './data/airing-series-SNL.json';
import * as sportsData from './data/airing-sports-NBA.json';
import * as moviesData from './data/airing-movies-Silverado.json';
import * as programsData from './data/airing-manual.json';

import * as seriesShowData from './data/show-series-SNL.json';

import { EVENT, MOVIE, PROGRAM, SERIES } from '../renderer/constants/app';
import Show from '../renderer/utils/Show';

let airingSeries = new Airing(seriesData);
let airingSports = new Airing(sportsData);
let airingMovie = new Airing(moviesData);
let airingProgram = new Airing(programsData);
let showSeries: Show = new Show(seriesShowData);

beforeEach(() => {
  airingSeries = new Airing(seriesData);
  airingSports = new Airing(sportsData);
  airingMovie = new Airing(moviesData);
  airingProgram = new Airing(programsData);
  showSeries = new Show(seriesShowData);
});

test('get id', () => {
  expect(airingSeries.id).toBe(1342901);
});

test('get description', () => {
  expect(airingSeries.description).toMatch(/^Host Regina King; Nathaniel*/);
  // TODO: load full airing+show ==> mock the db
  // expect(airingMovie.description).toMatch(/^A stagecoach driver seeks*/);
  expect(airingSports.description).toMatch(/^The Cleveland Cavaliers become*/);
  expect(airingProgram.description).toBe('');
});

// TODO: make this work for other locales?
test('get datetime', () => {
  expect(airingSeries.datetime).toBe('2/13/2021 11:29 PM');
  expect(airingSports.datetime).toBe('5/9/2020 8:00 PM');
  expect(airingMovie.datetime).toBe('5/28/2020 2:35 AM');
  expect(airingProgram.datetime).toBe('4/7/2021 9:00 PM');
});

test('showTitle', () => {
  expect(airingSeries.airingDetails.show_title).toBe(airingSeries.showTitle);
});

test('episodeTitle', () => {
  // airingSeries.episode.title = null;

  expect(airingSeries.episodeTitle).toBe('Regina King; Nathaniel Rateliff');
});

// TODO: adding the sanitze call seems wrong?
test('get title', () => {
  expect(airingSeries.title).toBe(sanitize(airingSeries.episodeTitle));
  expect(airingMovie.title).toBe(sanitize(airingMovie.movieTitle));
  expect(airingSports.title).toBe(sanitize(airingSports.eventTitle));
  expect(airingProgram.title).toBe(sanitize(airingProgram.showTitle));
  airingProgram.path = '';
  expect(airingProgram.title).toBe('');
});

test('episodeNum', () => {
  expect(airingSeries.episodeNum).toBe('s46e12');
  expect(airingSports.episodeNum).toBe('s00e00');
  expect(airingMovie.episodeNum).toBe('s00e00');
  expect(airingProgram.episodeNum).toBe('s00e00');
});

test('seasonNum', () => {
  expect(airingSeries.seasonNum).toBe('46');
  expect(airingSports.seasonNum).toBe('00');
  expect(airingMovie.seasonNum).toBe('00');
  expect(airingProgram.seasonNum).toBe('00');
});

test('duration', () => {
  expect(airingSeries.duration).toBe('1:33:00');
  expect(airingSports.duration).toBe('3:00:00');
  expect(airingMovie.duration).toBe('1:40:00');
  expect(airingProgram.duration).toBe('05:00');
});

test('actualDuration', () => {
  expect(airingSeries.actualDuration).toBe('2:19:16');
  expect(airingSports.actualDuration).toBe('3:01:17');
  expect(airingMovie.actualDuration).toBe('1:41:15');
  expect(airingProgram.actualDuration).toBe('05:16');
});

test('type', () => {
  expect(airingSeries.type).toBe(SERIES);
  expect(airingSports.type).toBe(EVENT);
  expect(airingMovie.type).toBe(MOVIE);
  expect(airingProgram.type).toBe(PROGRAM);
});

test('typePath', () => {
  expect(airingSeries.typePath).toBe(airingSeries.series_path);
  expect(airingSports.typePath).toBe(airingSports.sport_path);
  expect(airingMovie.typePath).toBe(airingMovie.movie_path);
  expect(airingProgram.typePath).toBe('');

  airingSeries.path = 'testing';
  expect(() => airingSeries.typePath).toThrow(Error);
});

test('isEpisode', () => {
  expect(airingSeries.isEpisode).toBe(true);
  expect(airingSports.isEpisode).toBe(false);
  expect(airingMovie.isEpisode).toBe(false);
  expect(airingProgram.isEpisode).toBe(false);
});

test('isEvent', () => {
  expect(airingSeries.isEvent).toBe(false);
  expect(airingSports.isEvent).toBe(true);
  expect(airingMovie.isEvent).toBe(false);
  expect(airingProgram.isEvent).toBe(false);
});

const SERIES_AIRING_SNAPSHOT = 1362508;
const SERIES_SHOW_COVER_ID = 1295065;
const SERIES_SHOW_BG_ID = 1295066;
const SERIES_SHOW_TN_ID = 1295064;

test('isMovie', () => {
  expect(airingSeries.isMovie).toBe(false);
  expect(airingSports.isMovie).toBe(false);
  expect(airingMovie.isMovie).toBe(true);
  expect(airingProgram.isMovie).toBe(false);
});

test('background', () => {
  // no show has been loaded into it...
  expect(airingSeries.background).toBe(SERIES_AIRING_SNAPSHOT);
  airingSeries.show = showSeries;
  expect(airingSeries.background).toBe(SERIES_SHOW_BG_ID);
});

test('thumbnail', () => {
  // no show has been loaded into it...
  expect(airingSeries.thumbnail).toBe(SERIES_AIRING_SNAPSHOT);
  airingSeries.show = showSeries;
  expect(airingSeries.thumbnail).toBe(SERIES_SHOW_TN_ID);
});

test('image', () => {
  // expected...
  expect(airingSeries.image).toBe(SERIES_AIRING_SNAPSHOT);

  airingSeries.snapshotImage = {};
  // no show has been loaded...
  expect(airingSeries.image).toBe(0);

  airingSeries.show = showSeries;
  expect(airingSeries.image).toBe(SERIES_SHOW_COVER_ID);
});
