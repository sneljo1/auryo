import { Auryo } from '../app';
import ApplicationMenu from './core/applicationMenu';
import AppUpdater from './core/appUpdater';
import ChromecastManager from './core/chromecast/chromecastManager';
import ConfigManager from './core/configManager';
import IPCManager from './core/ipcManager';
import LastFm from './core/lastFm';
import NotificationManager from './core/notificationManager';
import PowerMonitor from './core/powerMonitor';
import ShortcutManager from './core/shortcutManager';
import { Feature } from './feature';
import DbusService from './linux/dbusService';
import MprisService from './linux/mprisService';
import MediaServiceManager from './mac/mediaServiceManager';
import TouchBarManager from './mac/touchBarManager';
import Thumbar from './win32/thumbar';
import Win10MediaService from './win32/win10/win10MediaService';

export const tools: typeof Feature[] = [
  LastFm,
  ConfigManager,
  AppUpdater,
  IPCManager,
  PowerMonitor,
  ShortcutManager,
  ApplicationMenu,
  NotificationManager,
  ChromecastManager,
  // Mac
  TouchBarManager,
  MediaServiceManager,

  // Windows
  Win10MediaService,
  Thumbar,

  // Linux
  MprisService,
  DbusService
];

export const getTools = (app: Auryo) => tools.map(FeatureClass => new FeatureClass(app)).filter(o => o.shouldRun());
