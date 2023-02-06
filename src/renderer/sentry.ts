import Debug from 'debug';
import { version } from '../../release/app/package.json';
import getConfig from './utils/config';

const debug = Debug('tablo-tools:sentry');

const ignoreError = (event: any) => {
  debug('Ignored: %s', JSON.stringify(event, null, 2));
  return null;
};

const setupSentry = (init: any) => {
  if (process.env.NODE_ENV === 'production') {
    init({
      dsn: 'https://a19dbdc56dc54776a48d2acce4c99ddc@o381395.ingest.sentry.io/5208692',
      release: version,

      beforeSend(event: any) {
        const config = getConfig();
        if (config?.allowErrorReport === false) return null;

        if (
          !event.exception ||
          !event.exception.values ||
          !event.exception.values[0]
        ) {
          return event;
        }

        const value = event.exception.values[0];

        // ignore errors we can't (currently) do anything about
        const errorText: string = value.value.toString();

        /**
         * test error message from Settings->Advanced (ExportData)
         */
        if (errorText.trim() === 'causeError 3!') {
          return ignoreError(event);
        }

        /**
         * this is /not/ my problem.
         */

        if (errorText.includes('ENOSPC: no space left on device')) {
          return ignoreError(event);
        }

        if (errorText.includes('net::ERR_NETWORK_CHANGED')) {
          return ignoreError(event);
        }

        // TABLO-TOOLS-ELECTRON-FC
        if (errorText.includes('net::ERR_NAME_NOT_RESOLVED')) {
          return ignoreError(event);
        }

        // TABLO-TOOLS-ELECTRON-FC
        if (errorText.includes('net::ERR_CERT_AUTHORITY_INVALID')) {
          return ignoreError(event);
        }

        // TABLO-TOOLS-ELECTRON-V4
        if (
          errorText.includes('Error: Unable to find latest version on GitHub')
        ) {
          return ignoreError(event);
        }

        // TABLO-TOOLS-ELECTRON-EX
        if (
          errorText.includes('503') &&
          errorText.includes('method: GET url:') &&
          errorText.includes('tablo-tools-electron/releases.atom')
        ) {
          return ignoreError(event);
        }
        // more trying to catch TABLO-TOOLS-ELECTRON-EX
        if (errorText.includes('Hello future GitHubber')) {
          return ignoreError(event);
        }

        if (errorText.includes('Fatal Error: EXC_BAD_ACCESS')) {
          return ignoreError(event);
        }

        // TABLO-TOOLS-ELECTRON-NX
        if (errorText.includes('Fatal Error: EXCEPTION_BREAKPOINT')) {
          return ignoreError(event);
        }

        // TABLO-TOOLS-ELECTRON-NF
        if (errorText.includes('Fatal Error: SIGBUS')) {
          return ignoreError(event);
        }

        // TABLO-TOOLS-ELECTRON-CR
        if (errorText.includes('ResizeObserver loop limit exceeded')) {
          return ignoreError(event);
        }

        // TABLO-TOOLS-ELECTRON-ST
        if (
          errorText.includes(
            'Cannot download "https://objects.githubusercontent.com/github-production'
          )
        ) {
          return ignoreError(event);
        }

        // Kind of my fault... these are folks running a beta after I've deleted its assets
        // TABLO-TOOLS-ELECTRON-NH
        if (
          errorText.includes(
            'Cannot find latest.yml in the latest release artifacts'
          )
        ) {
          return ignoreError(event);
        }

        /**
         * auto-updater on Windows
         */

        // #TABLO-TOOLS-ELECTRON-SJ - the auto updater on Windows being funky
        if (
          errorText.includes('ENOENT: no such file or directory, rename') &&
          errorText.includes('temp-TabloTools-Setup')
        ) {
          return ignoreError(event);
        }
        // #TABLO-TOOLS-ELECTRON-SG - the auto updater on Windows being funky
        if (
          errorText.includes('EPERM: operation not permitted, open') &&
          errorText.includes('temp-TabloTools-Setup')
        ) {
          return ignoreError(event);
        }
        // #TABLO-TOOLS-ELECTRON-D1 - the auto updater on Windows being funky
        if (
          errorText.includes(
            'Command failed: powershell.exe -NoProfile -NonInteractive -InputFormat None -Command Get-AuthenticodeSignature'
          )
        ) {
          return ignoreError(event);
        }

        // TABLO-TOOLS-ELECTRON-QP
        if (errorText.includes('EBUSY: resource busy or locked, rename')) {
          return ignoreError(event);
        }

        // #TABLO-TOOLS-ELECTRON-SS - the auto updater on Linux being funky
        if (
          errorText.includes('ENOENT: no such file or directory, chmod') &&
          errorText.includes('tablo-tools-updater')
        ) {
          return ignoreError(event);
        }

        // #TABLO-TOOLS-ELECTRON-VC - the auto updater on Mac being funky
        if (
          errorText.includes('ENOENT: no such file or directory, rename') &&
          errorText.includes('tablo-tools-updater')
        ) {
          return ignoreError(event);
        }

        /**
         * nedb not behaving
         *  - pre seald/nedb - a locking error, not actually an error
         *  - post seald/nedb - still not actually an error, just happens on first usage of 0.3+?
         */

        // #TABLO-TOOLS-ELECTRON-R6 - nedb causing fake errors trying to rename tmp files
        if (
          errorText.includes('ENOENT: no such file or directory, rename') &&
          errorText.includes('.db~')
        ) {
          return ignoreError(event);
        }
        // #TABLO-TOOLS-ELECTRON-RS - nedb causing fake errors trying to rename tmp files
        if (
          errorText.includes('ENOENT: no such file or directory, open') &&
          errorText.includes('.db~')
        ) {
          return ignoreError(event);
        }
        if (
          errorText.includes('EPERM: operation not permitted, rename') &&
          errorText.includes('.db~')
        ) {
          return ignoreError(event);
        }

        // Okay, send it!
        if (value.stacktrace && value.stacktrace.frames) {
          value.stacktrace.frames.forEach((frame: any) => {
            if (frame && frame.filename && frame.filename.includes('dist/')) {
              // this is stupid, but it seems to work for now @sentry/electron": "4.0.1"
              // eslint-disable-next-line no-param-reassign
              frame.filename = frame.filename.replace(
                'dist/',
                'release/app/dist/'
              );
              // eslint-disable-next-line no-param-reassign
              frame.filename = frame.filename.replace('app/app/', 'app/');
            }
          });
        }
        return event;
      },
    });
  }
};
export default setupSentry;
