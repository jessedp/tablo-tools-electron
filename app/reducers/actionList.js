// @flow
import {
  ADD_AIRING,
  REM_AIRING,
  BULK_ADD_AIRINGS,
  BULK_REM_AIRINGS
} from '../actions/actionList';
import type { Action } from './types';
import Airing from '../utils/Airing';

export type ActionListStateType = Array<Airing>;

const initialState: ActionListStateType = [];

export default function manageActionList(
  state: ActionListStateType = initialState,
  action: Action
) {
  const { airing, airings } = action;
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

    case BULK_ADD_AIRINGS:
      return airings;

    case BULK_REM_AIRINGS:
      return [];

    default:
      return state;
  }
}
