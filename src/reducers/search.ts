import { SEARCH, SEND_RESULTS } from '../actions/types';
import type { Action } from './types';
import { VIEW_GRID } from './constants';
import Airing from '../utils/Airing';

export function changeView(state: string = VIEW_GRID, action: Action) {
  const { view } = action;

  switch (action.type) {
    case SEARCH:
      return view;

    default:
      return state;
  }
}
export function sendResults(state: Array<Airing> = [], action: Action) {
  const { results } = action;

  switch (action.type) {
    case SEND_RESULTS:
      return results;

    default:
      return state;
  }
}
