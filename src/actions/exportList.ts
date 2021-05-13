import { ExportRecordType } from '../reducers/types';

import {
  ADD_EXPORT,
  REM_EXPORT,
  UPDATE_EXPORT,
  BULK_ADD_EXPORTS,
  BULK_REM_EXPORTS,
} from './types';

export function addExportRecord(record: ExportRecordType) {
  return {
    type: ADD_EXPORT,
    record,
  };
}
export function remExportRecord(record: ExportRecordType) {
  return {
    type: REM_EXPORT,
    record,
  };
}
export function updateExportRecord(record: ExportRecordType) {
  return {
    type: UPDATE_EXPORT,
    record,
  };
}
export function bulkAddExportRecord(record: ExportRecordType[]) {
  return {
    type: BULK_ADD_EXPORTS,
    record,
  };
}
export function bulkRemExportRecord(record: ExportRecordType[]) {
  return {
    type: BULK_REM_EXPORTS,
    record,
  };
}
