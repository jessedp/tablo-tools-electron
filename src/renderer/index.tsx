import React from 'react';
import { render } from 'react-dom';

import PubSub from 'pubsub-js';
import { init } from '@sentry/electron/renderer';
import Root from './containers/Root';
import setupSentry from './sentry';

import { history, configuredStore } from './store';
import './app.global.css';

import { loadTemplates } from './utils/namingTpl';

setupSentry(init);

const store = configuredStore();

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
