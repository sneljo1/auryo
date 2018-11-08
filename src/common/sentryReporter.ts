// import * as ElectronSentry from '@sentry/electron';
// import { SentryEventHint } from '@sentry/types';
// const app = is.renderer() ? remote.app : electronApp;
// const options: ElectronSentry.ElectronOptions = {
//   debug: true,
//   enabled: true, // settings.get('app.crashReports') === true && process.env.NODE_ENV === 'production',
//   dsn: CONFIG.SENTRY_REPORT_URL,
//   release: app.getVersion(),
//   environment: process.env.NODE_ENV,
//   beforeSend: (event: ElectronSentry.SentryEvent, hint?: SentryEventHint) => {
//     console.log('======================', 'SENTRY');
//     console.log('sentry', event);
//     return event;
//   }
// };
// ElectronSentry.init(options);
// ElectronSentry.configureScope((scope) => {
//   scope.setTag('platform', os.platform());
//   scope.setUser({
//     id: (settings.get('token') as string || '')
//   });
// });
import { BrowserOptions, init as BrowserInit } from '@sentry/browser';
import { init as NodeInit, NodeOptions } from '@sentry/node';
import { SentryEvent, SentryEventHint, SentryException, Stacktrace } from '@sentry/types';
import { app as electronApp, remote } from 'electron';
import * as is from 'electron-is';
import { CONFIG } from '../config';


const app = is.renderer() ? remote.app : electronApp;

const APP_PATH = app.getAppPath().replace(/\\/g, '/');

const normalizeUrl = (url: string, base: string = APP_PATH): string => {

  const regex = /(main\.js|index\.html|manifest\.js|renderer\.js|vendor\.js)/gm;

  const match = regex.exec(decodeURI(url));

  if (match && match.length) {
    return `~/${match[0]}`;
  }

  return url;
};

const getStacktrace = (event: SentryEvent): Stacktrace | undefined => {
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
    const raven = (exception as any) as { values: Array<SentryException> };
    if (raven.values && raven.values[0]) {
      return raven.values[0].stacktrace;
    }
  }

  return undefined;
};

const options: BrowserOptions | NodeOptions = {
  debug: true,
  enabled: true, // settings.get('app.crashReports') === true && process.env.NODE_ENV === 'production'
  dsn: CONFIG.SENTRY_REPORT_URL,
  release: app.getVersion(),
  environment: process.env.NODE_ENV,
  beforeSend: (event: SentryEvent, hint?: SentryEventHint) => {
    const copy = { ...event };

    // Retrieve stack traces and normalize their URLs. Without this, grouping
    // would not work due to user folders in file names.
    const stacktrace = getStacktrace(copy);
    if (stacktrace && stacktrace.frames) {
      stacktrace.frames.forEach((frame) => {
        if (frame.filename) {
          frame.filename = normalizeUrl(frame.filename);
        }
      });
    }

    const { request = {} } = copy;

    // The user agent is parsed by Sentry and would overwrite certain context
    // information, which we don't want. Generally remove it, since we know that
    // we are browsing with Chrome.
    if (request.headers) {
      delete request.headers['User-Agent'];
    }

    // The Node SDK currently adds a default tag for server_name, which contains
    // the machine name of the computer running Electron. This is not useful
    // information in this case.
    const { tags = {} } = copy;
    delete tags.server_name;

    return copy;
  }
};

if (is.renderer()) {
  BrowserInit(options);
} else {
  if (!(process.platform === 'linux' && process.env.SNAP_USER_DATA != null)) {
    NodeInit(options);
  }
}
