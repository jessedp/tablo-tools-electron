// @flow
// import type { GetActionList, Dispatch } from '../reducers/types';

import Airing from '../utils/Airing';

export const ADD_AIRING = 'ADD_AIRING';
export const ADD_AIRINGS = 'ADD_AIRINGS';
export const REM_AIRING = 'REM_AIRING';
export const REM_AIRINGS = 'REM_AIRINGS';

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
