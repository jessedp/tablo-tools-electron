// @flow
import { SEND_FLASH } from '../actions/flash';

import type { Action, FlashRecordType } from './types';

export function sendFlash(
  state: FlashRecordType = { message: '', type: 'success' },
  action: Action
) {
  const { message } = action;

  switch (action.type) {
    case SEND_FLASH:
      return message;
    default:
      return state;
  }
}

export const DONTMAKEHAVEADEFAULT = 'please';
