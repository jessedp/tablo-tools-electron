import React from 'react';
import { render } from 'react-dom';
// require('@electron/remote/main').initialize();

// import main from '@electron/remote/main';
// main.initialize();

import PubSub from 'pubsub-js';
import Root from './containers/Root';

// import { configureStore, history } from './store/configureStore';
// import { Store } from './store';
import { history, configuredStore } from './store';
import './app.global.css';
// import { setupApi } from './utils/Tablo';
// import { setupDb } from './utils/db';
import { loadTemplates } from './utils/namingTpl';

const store = configuredStore();

window.electron.ipcRenderer.on('ping', (message: any) => {
  console.log('Ping says: ', message);
});

// window.electron.ipcRenderer.send('ping');
// require('electron').ipcRenderer.on('ping', (event, message) => {
//   console.log(message);
// });

// BOO, this is in (and ignored) @types/global.d.ts

declare global {
  interface Window {
    require: any;
    ipcRenderer: any;
    webFrame: any;
    Tablo: any;
    Airing: any;
    Templates: any;
    db: any;
    fs: any;
    os: any;
    electron: {
      ipcRenderer: any;

      path: any;
      os: any;
      shell: any;
      Tablo: any;
      AsyncNedb: any;
      ffmpeg: any;
      archiver: any;
      store: {
        delete: (key: string) => any;
        get: (key: string) => any;
        set: (key: string, val: any) => void;
      };
    };
  }
}

// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace NodeJS {
//     interface Global {
//       document: Document;
//       window: Window;
//       navigator: Navigator;

//       discoveredDevices: Array<any>;
//       CONNECTED: boolean;
//       EXPORTING: boolean;

//       RecDb: any;
//       ShowDb: any;
//       ChannelDb: any;
//       SearchDb: any;
//       NamingDb: any;
//       ExportLogDb: any;
//       Templates: any;
//       Api: any;
//     }
//   }
// }

// require('./sentry');

// const store = configureStore();

// OLDeslint-disable-next-line compat/compat

window.Tablo.setup();
console.log('finsihed Tablo setup');
window.db.setup();
console.log('finsihed db setup');
window.Templates.load();
console.log('templates loaded');
loadTemplates();

render(
  <Root store={store} history={history} />,
  document.getElementById('root')
);

// render(<>hi!</>, document.getElementById('root'));

// const run = new Promise((resolve, reject) => {
//   window.Tablo.setup()
//     .then(() => {
//       console.log('tablo setup done in render');
//       window.db
//         .setup()
//         .then(() => {
//           resolve('setup');
//           return 'done';
//         })
//         .catch((e: any) => {
//           console.log('setupDb failed in renderer', e);
//         });
//     })
//     .catch((e: any) => {
//       console.log('setupApi failed in render', e);
//     });
// });

// const run2 = new Promise((resolve, reject) => {
//   setupApi()
//     .then(() => {
//       setupDb()
//         .then(() => {
//           loadTemplates();
//           PubSub.subscribe('DEVICE_CHANGE', setupDb);
//           resolve('done');
//           return 'why';
//         })
//         .catch((e) => {
//           console.log('setupDb failed.');
//           reject(e);
//         });
//       return 'why';
//     })
//     .catch((e) => {
//       console.log('setupApi failed.', e);
//       reject(e);
//     });
// });
// console.log('loading....');

// document.addEventListener('DOMContentLoaded', () => {
//   run
//     .then(() => {
//       return render(
//         <Root store={store} history={history} />,
//         document.getElementById('root')
//       );
//     })
//     .catch((e) => {
//       console.error(e);
//       throw e;
//     });
// });
