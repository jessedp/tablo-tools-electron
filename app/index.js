import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';

import PubSub from 'pubsub-js';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import './app.global.css';
import { setupApi } from './utils/Tablo';
import { setupDb } from './utils/db';

require('./sentry');

const store = configureStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

const run = new Promise((resolve, reject) => {
  setupApi(false)
    .then(() => {
      setupDb(false)
        .then(() => {
          PubSub.subscribe('DEVICE_CHANGE', setupDb);
          resolve('done');
          return 'why';
        })
        .catch(e => {
          reject(e);
        });
      return 'why';
    })
    .catch(e => {
      reject(e);
    });
});

run
  .then(() => {
    return render(
      <AppContainer>
        <Root store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  })
  .catch(e => {
    console.error(e);
    throw e;
  });
