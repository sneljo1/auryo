/* eslint-disable import/first */
import '@common/sentryReporter';
import path from 'path';

if (process.env.TOKEN) {
  process.env.ENV = 'test';
}

if (process.argv.some(arg => arg === '--development') || process.argv.some(arg => arg === '--dev')) {
  process.env.ENV = 'development';
}

let staticPath = path.resolve(__dirname, '..', '..', 'static');

if (process.env.NODE_ENV !== 'development') {
  staticPath = path.resolve(__dirname, 'static');
}

global.__static = staticPath.replace(/\\/g, '\\\\');

// eslint-disable-next-line import/no-extraneous-dependencies
import { app, systemPreferences } from 'electron';
import { Auryo } from './app';
import { Logger } from './utils/logger';
import { configureStore } from '@common/configureStore';
import is from 'electron-is';

const store = configureStore();

const auryo = new Auryo(store);

// Quit when all windows are closed
app.on('window-all-closed', () => {
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

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', async () => {
  if (is.osx()) {
    systemPreferences.isTrustedAccessibilityClient(true);
  }

  try {
    await auryo.start();
  } catch (err) {
    Logger.defaultLogger().error(err);
  }
});
