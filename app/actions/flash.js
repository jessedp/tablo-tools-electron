// @flow
import type { FlashRecordType } from '../reducers/types';

export const SEND_FLASH = 'SEND_FLASH';

export function sendFlash(message: FlashRecordType) {
  return {
    type: SEND_FLASH,
    message
  };
}
