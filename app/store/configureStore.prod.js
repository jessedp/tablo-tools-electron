// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

import createRootReducer from '../reducers';
import type { actionListType } from '../reducers/types';

const history = createHashHistory();
const rootReducer = createRootReducer(history);
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function configureStore(initialState?: actionListType) {
  // Middleware: Redux Persist Config
  const persistConfig = {
    // Root
    key: 'root',
    storage,
    // Whitelist (Save Specific Reducers)
    whitelist: ['manageActionList', 'changeView', 'exportList'],
    // Blacklist (Don't Save Specific Reducers)
    blacklist: []
  };
  // Middleware: Redux Persist Persisted Reducer
  const persistedReducer = persistReducer(persistConfig, rootReducer);
  return createStore(persistedReducer, initialState, enhancer);
}

export default { configureStore, history };
