/**
const { app } = require('electron').remote;

const appVersion = app.getVersion();
   * */
const { init } =
  process.type === 'browser'
    ? require('@sentry/electron/dist/main')
    : require('@sentry/electron/dist/renderer');

if (process.env.NODE_ENV === 'production') {
  init({
    dsn:
      'https://a19dbdc56dc54776a48d2acce4c99ddc@o381395.ingest.sentry.io/5208692',
    org: 'jessedp',
    project: 'tablo-tools-electron'
  });
}
