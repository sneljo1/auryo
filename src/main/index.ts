/* eslint-disable import/first */
import '@common/sentryReporter';
import path from 'path';

if (process.env.TOKEN) {
  process.env.ENV = 'test';
}

if (process.argv.some((arg) => arg === '--development') || process.argv.some((arg) => arg === '--dev')) {
  process.env.ENV = 'development';
}

let staticPath = path.resolve(__dirname, '..', '..', 'static');

if (process.env.NODE_ENV !== 'development') {
  staticPath = path.resolve(__dirname, 'static');
}

global.__static = staticPath.replace(/\\/g, '\\\\');

import { configureStore } from '@common/store';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, systemPreferences } from 'electron';
import is from 'electron-is';
import { Auryo } from './app';
import { Logger } from './utils/logger';

const mainStore = configureStore();

const auryo = new Auryo(mainStore);

const logger = Logger.defaultLogger();

app.setAppUserModelId('com.auryo.core');
app.setAsDefaultProtocolClient('auryo');

registerListeners();

const isSingleInstance = requestInstanceLock();

if (isSingleInstance) {
  app.on('second-instance', (_e, argv) => {
    // Handle protocol url for Windows
    if (is.windows()) {
      auryo.handleProtocolUrl(argv[1]);
    }
  });

  // This method will be called when Electron has done everything
  // initialization and ready for creating browser windows.
  app.whenReady().then(async () => {
    if (is.osx()) systemPreferences.isTrustedAccessibilityClient(true);

    // Handle protocol url for Windows
    if (is.windows()) {
      auryo.handleProtocolUrl(process.argv[1]);
    }

    try {
      await auryo.start();
    } catch (err) {
      logger.error('Error starting auryo', err);
    }
  });
}

// Helpers

function requestInstanceLock() {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    logger.debug('Not the first instance, gonna quit.');
    app.quit();
  }

  return gotTheLock;
}

function registerListeners() {
  app.on('before-quit', () => {
    logger.info('Application exiting...');
    auryo.setQuitting(true);
  });

  // Quit when all windows are closed
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (auryo.mainWindow) {
      auryo.mainWindow.show();
    } else {
      // Something went wrong
      app.quit();
    }
  });

  // Handle protocol url for MacOS
  app.on('open-url', (event, data) => {
    event.preventDefault();

    auryo.handleProtocolUrl(data);
  });
}
