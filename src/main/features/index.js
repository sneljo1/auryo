import ApplicationMenu from './ApplicationMenu';
import AppUpdater from './AppUpdater';
import ConfigManager from './ConfigManager';
import ExceptionManager from './ExceptionManager';
import IPCManager from './IPCManager';
import MprisService from './linux/MprisService';
import MediaServiceManager from './mac/MediaServiceManager';
import TouchBarManager from './mac/TouchBarManager';
import PowerMonitor from './PowerMonitor';
import ShortcutManager from './ShortcutManager';
import Thumbar from './win32/Thumbar';
import Win10MediaService from './win32/win10/Win10MediaService';

export const tools = [
    AppUpdater,
    Thumbar,
    IPCManager,
    PowerMonitor,
    ShortcutManager,
    ExceptionManager,
    ConfigManager,
    ApplicationMenu,
    TouchBarManager,
    MediaServiceManager,
    MprisService,
    Win10MediaService
]

export const getTools = (app) => tools.map(Feature => new Feature(app))
    .filter(o => o.shouldRun())