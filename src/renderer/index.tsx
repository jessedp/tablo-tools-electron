import { render } from 'react-dom';

import { init } from '@sentry/electron/renderer';
import Root from './containers/Root';
import setupSentry from './sentry';

import { history, configuredStore } from './store';
import './app.global.css';

import { loadTemplates } from './utils/namingTpl';
import { ConfigType } from './constants/types_config';

setupSentry(init);

const store = configuredStore();
localStorage.debug = 'tablo-tools*';

// FIX ME: this /should/ have been covered by global.d.ts, but things like
// window.db in src/renderer/utils/Airing.tsx complain if this doesn't exist
declare global {
  /* eslint-disable-next-line no-unused-vars */
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
    path: any;
    config: ConfigType;
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

window.Tablo.setup();
console.log('finsihed Tablo, db setup');
window.Templates.load();
console.log('templates loaded');
loadTemplates();

render(
  <Root store={store} history={history} />,
  document.getElementById('root')
);
