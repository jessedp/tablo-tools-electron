import Show from '../renderer/utils/Show';
import * as seriesData from './data/show-series-SNL.json';
import * as sportsData from './data/show-sports-NBA.json';
import * as moviesData from './data/show-movies-Silverado.json';

let showSeries: Show = new Show(seriesData);
let showSports: Show = new Show(sportsData);
let showMovies: Show = new Show(moviesData);

beforeEach(() => {
  showSeries = new Show(seriesData);
  showSports = new Show(sportsData);
  showMovies = new Show(moviesData);
});

test('get id', () => {
  expect(showSeries.id).toBe(593660);
});

test('get description', () => {
  expect(showSeries.description).toMatch(/^Live from New York*/);
  expect(showMovies.description).toMatch(/^A stagecoach driver seeks*/);
  expect(showSports.description).toMatch(/^Replay of games from the 2016*/);

  showSports.path = '';
  expect(showSports.description).toBe('');
});

test('get title', () => {
  expect(showSeries.title).toBe('Saturday Night Live');
  expect(showSports.title).toBe('2016 NBA Finals');
  expect(showMovies.title).toBe('Adventures in Silverado');

  showMovies.path = '';
  expect(showMovies.title).toBe('');
});

test('sortable title', () => {
  showSeries.series.title = 'First';
  expect(showSeries.sortableTitle).toBe('first');

  showSeries.series.title = '20/20';
  expect(showSeries.sortableTitle).toBe('zzz 20/20');

  showSeries.series.title = 'Two Words';
  expect(showSeries.sortableTitle).toBe('two words');

  showSeries.series.title = '2 Words';
  expect(showSeries.sortableTitle).toBe('zzz 2 words');

  showSeries.series.title = '222 Words';
  expect(showSeries.sortableTitle).toBe('zzz 222 words');

  showSeries.series.title = 'The Two Words';
  expect(showSeries.sortableTitle).toBe('two words');

  showSeries.series.title = 'The 2 Words';
  expect(showSeries.sortableTitle).toBe('zzz 2 words');
});

test('check type self identification', () => {
  expect(showSeries.isEpisode).toBe(true);
  expect(showSeries.isEvent).toBe(false);
  expect(showSeries.isMovie).toBe(false);

  expect(showSports.isEpisode).toBe(false);
  expect(showSports.isEvent).toBe(true);
  expect(showSports.isMovie).toBe(false);

  expect(showMovies.isEpisode).toBe(false);
  expect(showMovies.isEvent).toBe(false);
  expect(showMovies.isMovie).toBe(true);
});

const SERIES_COVER_ID = 1295065;
const SERIES_BG_ID = 1295066;
const SERIES_TN_ID = 1295064;

const SPORTS_COVER_ID = 941949;
const SPORTS_BG_ID = 941950;
const SPORTS_TN_ID = 941948;

const MOVIES_COVER_ID = 930053;
const MOVIES_BG_ID = 930054;
const MOVIES_TN_ID = 930052;

// Image fallback chain
test('get cover', () => {
  expect(showSeries.cover).toBe(SERIES_COVER_ID);
  expect(showSports.cover).toBe(SPORTS_COVER_ID);
  expect(showMovies.cover).toBe(MOVIES_COVER_ID);
  showSeries.series = {};
  showSports.sport = {};
  showMovies.movie = {};
  expect(showSeries.cover).toBe(showSeries.background);
  expect(showSports.cover).toBe(showSports.background);
  expect(showMovies.cover).toBe(showMovies.background);
});

test('get background', () => {
  expect(showSeries.background).toBe(SERIES_BG_ID);
  expect(showSports.background).toBe(SPORTS_BG_ID);
  expect(showMovies.background).toBe(MOVIES_BG_ID);
  showSeries.series = {};
  showSports.sport = {};
  showMovies.movie = {};
  expect(showSeries.cover).toBe(showSeries.thumbnail);
  expect(showSports.cover).toBe(showSports.thumbnail);
  expect(showMovies.cover).toBe(showMovies.thumbnail);
});

test('get thumbnail', () => {
  expect(showSeries.thumbnail).toBe(SERIES_TN_ID);
  expect(showSports.thumbnail).toBe(SPORTS_TN_ID);
  expect(showMovies.thumbnail).toBe(MOVIES_TN_ID);
  showSeries.series = {};
  showSports.sport = {};
  showMovies.movie = {};
  expect(showSeries.cover).toBe(0);
  expect(showSports.cover).toBe(0);
  expect(showMovies.cover).toBe(0);
});

test('unknown type images', () => {
  showMovies.path = '';
  expect(showMovies.background).toBe(0);
  expect(showMovies.thumbnail).toBe(0);
  expect(showMovies.cover).toBe(0);
});
