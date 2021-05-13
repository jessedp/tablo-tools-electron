import type { FlashRecordType } from '../reducers/types';
import { SEND_FLASH } from './types';

export function sendFlash(message: FlashRecordType) {
  return {
    type: SEND_FLASH,
    message,
  };
}

export function noDefault() {}
