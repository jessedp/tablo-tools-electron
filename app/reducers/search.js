// @flow
import { SEARCH } from '../actions/search';
import type { Action } from './types';
import { VIEW_GRID } from './constants';

export default function changeView(state: string = VIEW_GRID, action: Action) {
  const { view } = action;

  switch (action.type) {
    case SEARCH:
      return view;
    default:
      return state;
  }
}
