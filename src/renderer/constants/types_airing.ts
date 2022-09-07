import Airing from '../utils/Airing';

export type ProgramData = {
  path: string;
  airing: Airing;
  airings: Array<Airing>;
  count: number;
  unwatched: number;
};
