// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import type { HashHistory } from 'history';
import manageActionList from './actionList';
import manageExportList from './exportList';
import { changeView, sendResults } from './search';
import { sendFlash } from './flash';

export default function createRootReducer(history: HashHistory) {
  return combineReducers<{}, *>({
    router: connectRouter(history),
    actionList: manageActionList,
    exportList: manageExportList,
    view: changeView,
    results: sendResults,
    flash: sendFlash
  });
}
