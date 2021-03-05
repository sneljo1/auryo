import is from 'electron-is';
import { Auryo } from '../app';
import ApplicationMenu from './core/applicationMenu';
import AppUpdater from './core/appUpdater';
import ChromecastManager from './core/chromecast/chromecastManager';
import ConfigManager from './core/configManager';
import IPCManager from './core/ipcManager';
import PowerMonitor from './core/powerMonitor';
import ShortcutManager from './core/shortcutManager';
import { Feature } from './feature';

const tools: typeof Feature[] = [
  ConfigManager,
  AppUpdater,
  IPCManager,
  PowerMonitor,
  ShortcutManager,
  ApplicationMenu,
  ChromecastManager
];
export const getTools = (app: Auryo) => {
  if (is.windows()) {
    // eslint-disable-next-line
    tools.push(require('./win32/thumbar').default);
    // eslint-disable-next-line
    tools.push(require('./win32/win10/win10MediaService').default);
  }

  if (is.linux()) {
    // eslint-disable-next-line
    tools.push(require('./linux/mprisService').default);
    // eslint-disable-next-line
    tools.push(require('./linux/dbusService').default);
  }

  if (is.macOS()) {
    // eslint-disable-next-line
    tools.push(require('./mac/touchBarManager').default);
    // eslint-disable-next-line
    tools.push(require('./mac/mediaServiceManager').default);
  }

  return tools.map((FeatureClass) => new FeatureClass(app)).filter((o) => o.shouldRun());
};
