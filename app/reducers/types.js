import type { Dispatch as ReduxDispatch, Store as ReduxStore } from 'redux';

import Airing from '../utils/Airing';

export type counterStateType = {
  +counter: number
};

export type actionListType = {
  +airings: Array<Airing>
};

export type Action = {
  +type: string
};

export type GetActionList = () => actionListType;

export type GetState = () => counterStateType;

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<GetState, Action>;
