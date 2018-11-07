import { Auryo } from '../app';
import ApplicationMenu from './ApplicationMenu';
import AppUpdater from './AppUpdater';
import ConfigManager from './ConfigManager';
import IPCManager from './IPCManager';
import DbusService from './linux/dbusService';
import MprisService from './linux/mprisService';
import MediaServiceManager from './mac/mediaServiceManager';
import TouchBarManager from './mac/touchBarManager';
import PowerMonitor from './PowerMonitor';
import ShortcutManager from './ShortcutManager';
import Thumbar from './win32/thumbar';
import Win10MediaService from './win32/win10/win10MediaService';
import { IFeature } from './feature.interface';
import Feature from './feature';
import NotificationManager from './NotificationManager';

export const tools: Array<typeof Feature> = [
  AppUpdater,
  IPCManager,
  PowerMonitor,
  ShortcutManager,
  ConfigManager,
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

export const getTools = (app: Auryo) => tools.map((Feature) => new Feature(app)).filter((o: IFeature) => o.shouldRun());
