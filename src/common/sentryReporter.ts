import { app as electronApp, remote } from 'electron';
import * as is from 'electron-is';
import { CONFIG } from '../config';
import { settings } from '@main/settings';
const app = is.renderer() ? remote.app : electronApp;

const { init } = (is.main()
  ? require('@sentry/electron/dist/main')
  : require('@sentry/electron/dist/renderer'));

const options = {
  debug: true,
  enabled: settings.get('app.crashReports') === true && process.env.NODE_ENV === 'production',
  dsn: CONFIG.SENTRY_REPORT_URL,
  release: app.getVersion(),
  environment: process.env.NODE_ENV,
  beforeSend: (event: any, hint?: any) => {
    console.log('======================', 'SENTRY');
    console.log('sentry', event);
    return event;
  }
};

init(options);
