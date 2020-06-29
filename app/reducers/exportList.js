// @flow
import {
  ADD_EXPORT,
  REM_EXPORT,
  UPDATE_EXPORT,
  BULK_ADD_EXPORTS,
  BULK_REM_EXPORTS
} from '../actions/exportList';

import type { Action, ExportRecordType, ExportListStateType } from './types';

const initialState: ExportListStateType = {
  airing: null,
  airings: [],
  exportList: [],
  updateAiring: null
};

export default function manageExportList(
  state: ExportListStateType = initialState,
  action: Action
) {
  const { record: exportRecord, airings } = action;
  let airing;
  // let progress;
  if (exportRecord) {
    airing = exportRecord.airing;
    // progress = exportRecord.progress;
  }

  const { exportList } = state;
  switch (action.type) {
    case ADD_EXPORT:
      if (!exportList.find(rec => rec.airing.object_id === airing.object_id)) {
        const t = {
          ...state,
          ...{ exportList: [...exportList, exportRecord] }
        };
        return t;
      }
      // TODO: this might should just be return state
      return { ...state, ...{ exportList } };

    case REM_EXPORT: {
      const newList = ([...exportList].filter(
        rec => rec.airing.object_id !== airing.object_id
      ): Array<ExportRecordType>);
      return { ...state, ...{ newList } };
    }

    case UPDATE_EXPORT: {
      const index = exportList.findIndex(
        rec => rec.airing.object_id === exportRecord.airing.object_id
      );
      if (index !== -1) {
        // force a new object
        exportList[index] = { ...{}, ...exportRecord };
        return {
          ...state,
          ...{ exportList }
        };
      }
      console.warn('No Record to Update!', exportRecord);
      return state;
    }

    case BULK_ADD_EXPORTS:
      airings.forEach(item => {
        if (!exportList.find(rec => rec.airing.object_id === item.object_id)) {
          exportList.push(item);
        }
      });

      return { ...state, ...{ exportList } };

    case BULK_REM_EXPORTS: {
      if (!airings) return { ...state, ...{ exportList: [] } };
      const newList = ([...exportList].filter(
        rec => !airings.find(item => rec.airing.object_id === item.object_id)
      ): Array<ExportRecordType>);

      return { ...state, ...{ exportList: newList } };
    }

    default:
      return state;
  }
}
