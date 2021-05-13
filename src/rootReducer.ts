import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
// import counterReducer from './features/counter/counterSlice';
import manageActionList from './reducers/actionList';
import manageExportList from './reducers/exportList';
import { changeView, sendResults } from './reducers/search';
import { sendFlash } from './reducers/flash';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    actionList: manageActionList,
    exportList: manageExportList,
    view: changeView,
    results: sendResults,
    flash: sendFlash,
  });
}
