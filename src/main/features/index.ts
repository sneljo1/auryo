import { Auryo } from '../app';
import ApplicationMenu from './core/applicationMenu';
import AppUpdater from './core/appUpdater';
import ConfigManager from './core/configManager';
import IPCManager from './core/ipcManager';
import MprisService from './linux/mprisService';
import MediaServiceManager from './mac/mediaServiceManager';
import TouchBarManager from './mac/touchBarManager';
import PowerMonitor from './core/powerMonitor';
import ShortcutManager from './core/shortcutManager';
import Thumbar from './win32/thumbar';
import Win10MediaService from './win32/win10/win10MediaService';
import Feature from './feature';
import NotificationManager from './core/notificationManager';
import LastFm from './core/lastFm';
import DbusService from './linux/dbusService';

export const tools: Array<typeof Feature> = [
  LastFm,
  ConfigManager,
  AppUpdater,
  IPCManager,
  PowerMonitor,
  ShortcutManager,
  ApplicationMenu,
  NotificationManager,

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

export const getTools = (app: Auryo) => tools
  .map((Feature) => new Feature(app))
  .filter((o) => o.shouldRun());
