import { SearchAlert } from '../utils/types';

export const ON = 1;
export const OFF = 0;

export const YES = 1;
export const NO = 0;

export const SERIES = 'episode';
export const MOVIE = 'movie';
export const EVENT = 'event';
export const PROGRAM = 'program';

export const EXP_WAITING = 1;
export const EXP_WORKING = 2;
export const EXP_DONE = 3;
export const EXP_CANCEL = 4;
export const EXP_FAIL = 5;

export const EMPTY_SEARCHALERT: SearchAlert = {
  type: '',
  text: '',
  matches: []
};

export type ProgramData = {
  airing: Airing,
  airings: Array<Airing>,
  count: number,
  unwatched: number
};
