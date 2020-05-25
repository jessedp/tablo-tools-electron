// @flow
// import type { GetActionList, Dispatch } from '../reducers/types';

import Airing from '../utils/Airing';

export const ADD_AIRING = 'ADD_AIRING';
export const REM_AIRING = 'REM_AIRING';
export const BULK_ADD_AIRINGS = 'BULK_ADD_AIRINGS';
export const BULK_REM_AIRINGS = 'BULK_REM_AIRINGS';

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
