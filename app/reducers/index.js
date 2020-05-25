// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import type { HashHistory } from 'history';
import manageActionList from './actionList';
import { changeView, sendResults } from './search';

export default function createRootReducer(history: HashHistory) {
  return combineReducers<{}, *>({
    router: connectRouter(history),
    actionList: manageActionList,
    view: changeView,
    results: sendResults
  });
}
