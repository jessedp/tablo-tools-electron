// @flow
import { ADD_AIRING, REM_AIRING } from '../actions/actionList';
import type { Action } from './types';
import Airing from '../utils/Airing';

export type ActionListStateType = Array<Airing>;

const initialState: ActionListStateType = [];

export default function manageActionList(
  state: ActionListStateType = initialState,
  action: Action
) {
  const { airing } = action;
  const actionList = state;
  switch (action.type) {
    case ADD_AIRING:
      if (!actionList.find(rec => rec.object_id === airing.object_id)) {
        return [...actionList, airing];
      }
      return state;
    case REM_AIRING: {
      return ([...actionList].filter(
        rec => rec.object_id !== airing.object_id
      ): ActionListStateType);
    }
    default:
      return state;
  }
}
