// @flow

import { ExportRecordType } from '../reducers/types';

export const ADD_EXPORT = 'ADD_EXPORT';
export const REM_EXPORT = 'REM_EXPORT';
export const UPDATE_EXPORT = 'UPDATE_EXPORT';
export const BULK_ADD_EXPORTS = 'BULK_ADD_EXPORTS';
export const BULK_REM_EXPORTS = 'BULK_REM_EXPORTS';

export function addExportRecord(record: ExportRecordType) {
  return {
    type: ADD_EXPORT,
    record
  };
}

export function remExportRecord(record: ExportRecordType) {
  return {
    type: REM_EXPORT,
    record
  };
}

export function updateExportRecord(record: ExportRecordType) {
  return {
    type: UPDATE_EXPORT,
    record
  };
}

export function bulkAddExportRecord(record: ExportRecordType) {
  return {
    type: BULK_ADD_EXPORTS,
    record
  };
}

export function bulkRemExportRecord(record: ExportRecordType) {
  return {
    type: BULK_REM_EXPORTS,
    record
  };
}
