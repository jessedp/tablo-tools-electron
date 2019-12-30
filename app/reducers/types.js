import type { Dispatch as ReduxDispatch, Store as ReduxStore } from 'redux';

export type counterStateType = {
  +counter: number
};

export type Action = {
  +type: string
};

export type GetState = () => counterStateType;

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<GetState, Action>;

export type TabloImage = {
  image_id: number,
  has_title: boolean
};

export type ShowCounts = {
  airing_count: number,
  unwatched_count: number,
  protected_count: number,
  watched_and_protected_count: number,
  failed_count: number
};
