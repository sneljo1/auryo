import { app } from 'electron';
import * as os from 'os';
import { CONFIG } from '../../config';
import { settings} from '../settings';
import { init, setTagsContext } from '@sentry/electron';
import { SentryEvent } from '@sentry/node';

export const initialize = () => {
  // ref: https://github.com/electron/electron/issues/13767
  if (!(process.platform === 'linux' && process.env.SNAP_USER_DATA != null)) {
    app.on('ready', () => {
      init({
        shouldSend(e: SentryEvent) {
          const sendCrashReports = settings.get('app.crashReports');

          return sendCrashReports === true && process.env.NODE_ENV === 'production';
        },
        dsn: CONFIG.SENTRY_REPORT_URL,
        release: app.getVersion()
      });

      setTagsContext({
        platform: os.platform(),
        platform_version: os.release(),
        arch: os.arch()
      });
    });
  }
};
