// @flow
import {
  ADD_AIRING,
  REM_AIRING,
  BULK_ADD_AIRINGS,
  BULK_REM_AIRINGS,
  ADD_SHOW,
  REM_SHOW,
  REQ_EP_BY_SHOW,
  RCV_EP_BY_SHOW
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
  const { show } = action;
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
      airings.forEach(item => {
        if (!actionList.find(rec => rec.object_id === item.object_id)) {
          actionList.push(item);
        }
      });

      return [...actionList];

    case BULK_REM_AIRINGS: {
      if (!airings) return [];
      return ([...actionList].filter(
        rec => !airings.find(item => item.object_id === rec.object_id)
      ): ActionListStateType);
    }
    /** addShow w/ callback action jazz */
    case ADD_SHOW:
    case REQ_EP_BY_SHOW:
      return [...actionList];

    case RCV_EP_BY_SHOW:
      airings.forEach(item => {
        if (!actionList.find(rec => rec.object_id === item.object_id)) {
          actionList.push(item);
        }
      });
      return [...actionList];

    /** remShow w/ callback action */
    case REM_SHOW: {
      const newList = [];
      actionList.forEach(item => {
        if (item.path !== show.path) {
          newList.push(item);
        }
      });
      return [...newList];
    }

    default:
      return state;
  }
}
