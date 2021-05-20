import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
// eslint-disable-next-line import/no-cycle
// import counterReducer from './features/counter/counterSlice';
import manageActionList from './reducers/actionList';
import manageExportList from './reducers/exportList';

import { sendFlash } from './reducers/flash';
import searchReducer from './store/search';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    actionList: manageActionList,
    exportList: manageExportList,
    search: searchReducer,
    flash: sendFlash,
  });
}
