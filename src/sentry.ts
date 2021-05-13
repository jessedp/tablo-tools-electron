import { Event } from '@sentry/types';

const { init } =
  process.type === 'browser'
    ? require('@sentry/electron/dist/main')
    : require('@sentry/electron/dist/renderer');

const { version } = require('../package.json');

if (process.env.NODE_ENV === 'production') {
  init({
    dsn:
      'https://a19dbdc56dc54776a48d2acce4c99ddc@o381395.ingest.sentry.io/5208692',
    org: 'jessedp',
    project: 'tablo-tools-electron',
    release: version,
    beforeSend(event: Event) {
      if (
        !event.exception ||
        !event.exception.values ||
        !event.exception.values[0]
      ) {
        return event;
      }

      const value = event.exception.values[0];

      if (value.stacktrace && value.stacktrace.frames) {
        value.stacktrace.frames.forEach((frame) => {
          if (frame && frame.filename && frame.filename.includes('dist/')) {
            // this is stupid, but it seems to work for now @sentry/electron": "1.3.0
            // eslint-disable-next-line no-param-reassign
            frame.filename = frame.filename.replace('dist/', 'app/dist/');
            // eslint-disable-next-line no-param-reassign
            frame.filename = frame.filename.replace('app/app/', 'app/');
          }
        });
      }

      return event;
    },
  });
}
