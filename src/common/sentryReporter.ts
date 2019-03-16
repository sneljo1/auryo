import { settings } from '@main/settings';
import { app as electronApp, remote } from 'electron';
import * as is from 'electron-is';
import { CONFIG } from '../config';
const app = is.renderer() ? remote.app : electronApp;

const { init } = (is.main()
  ? require('@sentry/electron/dist/main')
  : require('@sentry/electron/dist/renderer'));

const APP_PATH = app.getAppPath().replace(/\\/g, '/');

const normalizeUrl = (url: string, base: string = APP_PATH): string => {

  const regex = /(main\.js|index\.html|manifest\.js|renderer\.js|vendor\.js)/gm;

  const match = regex.exec(decodeURI(url));

  if (match && match.length) {
    return `~/${match[0]}`;
  }

  return url;
};

const getStacktrace = (event: any): any | undefined => {
  const { stacktrace, exception } = event;

  // Try the main event stack trace first
  if (stacktrace) {
    return stacktrace;
  }

  if (exception) {
    // Raven Node adheres to the Event interface
    // @ts-ignore
    if (exception[0]) {
      // @ts-ignore
      // tslint:disable-next-line:no-unsafe-any
      return exception[0].stacktrace;
    }

    // Raven JS uses the full values interface, which has been removed
    const raven = (exception as any) as { values: Array<any> };
    if (raven.values && raven.values[0]) {
      return raven.values[0].stacktrace;
    }
  }

  return undefined;
};


const options = {
  enabled: settings.get('app.crashReports') === true && process.env.NODE_ENV === 'production',
  dsn: CONFIG.SENTRY_REPORT_URL,
  release: app.getVersion(),
  environment: process.env.NODE_ENV,
  beforeSend: (event: any, hint?: any) => {
    const copy = { ...event };

    const stacktrace = getStacktrace(copy);
    if (stacktrace && stacktrace.frames) {
      stacktrace.frames.forEach((frame: any) => {
        if (frame.filename) {
          frame.filename = normalizeUrl(frame.filename);
        }
      });
    }

    return event;
  }
};

init(options);
