import React from 'react';
import { render } from 'react-dom';

import PubSub from 'pubsub-js';
import Root from './containers/Root';

// import { configureStore, history } from './store/configureStore';
// import { Store } from './store';
import { history, configuredStore } from './store';
import './app.global.css';
import { setupApi } from './utils/Tablo';
import { setupDb } from './utils/db';
import { loadTemplates } from './utils/namingTpl';

const store = configuredStore();
declare global {
  namespace NodeJS {
    interface Global {
      document: Document;
      window: Window;
      navigator: Navigator;

      discoveredDevices: Array<any>;
      CONNECTED: boolean;
      EXPORTING: boolean;

      RecDb: any;
      ShowDb: any;
      ChannelDb: any;
      SearchDb: any;
      NamingDb: any;
      ExportLogDb: any;
      Templates: any;
      Api: any;
    }
  }
}

require('./sentry');

// const store = configureStore();

const run = new Promise((resolve, reject) => {
  setupApi()
    .then(() => {
      setupDb()
        .then(() => {
          loadTemplates();
          PubSub.subscribe('DEVICE_CHANGE', setupDb);
          resolve('done');
          return 'why';
        })
        .catch((e) => {
          reject(e);
        });
      return 'why';
    })
    .catch((e) => {
      reject(e);
    });
});

document.addEventListener('DOMContentLoaded', () => {
  run
    .then(() => {
      return render(
        <Root store={store} history={history} />,
        document.getElementById('root')
      );
    })
    .catch((e) => {
      console.error(e);
      throw e;
    });
});
