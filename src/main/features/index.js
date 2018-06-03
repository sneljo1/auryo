import AppUpdater from './AppUpdater'
import Thumbar from './win32/Thumbar'
import IPCManager from './IPCManager'
import PowerMonitor from './PowerMonitor'
import ShortcutManager from './ShortcutManager'
import ExceptionManager from './ExceptionManager'
import ConfigManager from './ConfigManager'
import ApplicationMenu from './ApplicationMenu'
import TouchBarManager from './mac/TouchBarManager.js'
import MprisService from './linux/MprisService'
import Win10MediaService from './win32/win10/Win10MediaService'
import MediaServiceManager from './mac/MediaServiceManager'

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

export const getTools = (app) => {
    return tools.map(feature => new feature(app))
        .filter(o => o.shouldRun())
}