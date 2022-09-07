import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';

// import manageActionList from './reducers/actionList';
// import manageExportList from './reducers/exportList';

// import { sendFlash } from './reducers/flash';
import buildReducer from './store/build';
import flashReducer from './store/flash';
import searchReducer from './store/search';
import actionListReducer from './store/actionList';
import exportListReducer from './store/exportList';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    actionList: actionListReducer,
    exportList: exportListReducer,
    search: searchReducer,
    flash: flashReducer,
    build: buildReducer,
  });
}
