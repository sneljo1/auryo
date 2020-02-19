// https://github.com/getsentry/sentry-electron/issues/142
// Fix for mod.require
// import { BrowserOptions, init as BrowserInit } from '@sentry/browser';
// import { init as NodeInit, NodeOptions, captureException } from '@sentry/node';
// eslint-disable-next-line import/no-extraneous-dependencies
import { init, ElectronOptions } from '@sentry/electron';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app as electronApp, remote } from 'electron';
import is from 'electron-is';
import { CONFIG } from '../config';
import { settings } from '../main/settings';

const isEnabled =
  !!CONFIG.SENTRY_REPORT_URL && !!settings.get('app.crashReports') === true && process.env.NODE_ENV === 'production';

const app = is.renderer() ? remote.app : electronApp;

const options: ElectronOptions = {
  enabled: isEnabled,
  dsn: CONFIG.SENTRY_REPORT_URL,
  release: app.getVersion(),
  environment: process.env.NODE_ENV
};

if (isEnabled) {
  init(options);
}

// if (isEnabled) {
//   if (is.renderer()) {
//     BrowserInit(options);
//   } else {
//     NodeInit(options);

//     // Handle uncaught exceptions
//     process.on('uncaughtException', error => {
//       Logger.defaultLogger().error(error);

//       captureException(error);

//       dialog.showMessageBox({
//         title: 'Unexpected Error',
//         type: 'error',
//         message: 'An Error Has Occurred',
//         detail: error.toString(),
//         buttons: ['Quit Now']
//       });

//       process.exit(1);
//     });

//     process.on('unhandledRejection', error => {
//       Logger.defaultLogger().error('unhandledRejection', error);

//       captureException(error);

//       dialog.showMessageBox({
//         title: 'Unexpected Error',
//         type: 'error',
//         message: 'An Error Has Occurred',
//         detail: error ? error.toString() : 'Unknown error',
//         buttons: ['Quit Now']
//       });

//       process.exit(1);
//     });
//   }
// }
