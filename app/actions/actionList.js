// @flow
// import type { GetActionList, Dispatch } from '../reducers/types';

import Airing, { getEpisodesByShow } from '../utils/Airing';
import Show from '../utils/Show';

export const ADD_AIRING = 'ADD_AIRING';
export const REM_AIRING = 'REM_AIRING';
export const BULK_ADD_AIRINGS = 'BULK_ADD_AIRINGS';
export const BULK_REM_AIRINGS = 'BULK_REM_AIRINGS';
export const ADD_SHOW = 'ADD_SHOW';
export const REM_SHOW = 'REM_SHOW';
export const REQ_EP_BY_SHOW = 'REQ_EP_BY_SHOW';
export const RCV_EP_BY_SHOW = 'RCV_EP_BY_SHOW';

export function addAiring(airing: Airing) {
  return {
    type: ADD_AIRING,
    airing
  };
}

export function remAiring(airing: Airing) {
  return {
    type: REM_AIRING,
    airing
  };
}

export function bulkAddAirings(airings: Array<Airing>) {
  return {
    type: BULK_ADD_AIRINGS,
    airings
  };
}

export function bulkRemAirings(airings: Array<Airing>) {
  return {
    type: BULK_REM_AIRINGS,
    airings
  };
}

export function addShowOrig(show: Show) {
  return {
    type: ADD_SHOW,
    show
  };
}

export function remShow(show: Show) {
  return {
    type: REM_SHOW,
    show
  };
}

export function reqEpisodesByShow(show: Show) {
  return {
    type: REQ_EP_BY_SHOW,
    show
  };
}

export function rcvEpisodesByShow(airings: Array<Airing>) {
  return {
    type: RCV_EP_BY_SHOW,
    airings
  };
}

export function addShow(show: Show) {
  return (dispatch: any) => {
    dispatch(reqEpisodesByShow(show));
    return getEpisodesByShow(show).then(airings => {
      dispatch(rcvEpisodesByShow(airings));
      return airings; // does nothing but make linter shutup
    });
  };
}
