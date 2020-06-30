// @flow
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';

import createRootReducer from '../reducers';
import type { actionListType } from '../reducers/types';

const history = createHashHistory();
const rootReducer = createRootReducer(history);
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, router);

function configureStore(initialState?: actionListType) {
  // Middleware: Redux Persist Persisted Reducer
  return createStore(rootReducer, initialState, enhancer);
}

export default { configureStore, history };
