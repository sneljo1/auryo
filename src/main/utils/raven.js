import { app } from "electron";
import os from "os";
import { CONFIG } from '../../config';
import settings from '../settings';
import { Logger } from './logger';

const { init } = require('@sentry/electron')

export const registerError = (err, ui) => {
    Logger.error(ui ? err.stack : err)
}

export const initialize = () => {

    // ref: https://github.com/electron/electron/issues/13767
    if (!(process.platform === 'linux' && process.env.SNAP_USER_DATA != null)) {
        app.on('ready', () => {
            const sendCrashReports = settings.get('app.crashReports')

            if (sendCrashReports && process.env.NODE_ENV === 'production') {
                init({
                    dsn: CONFIG.SENTRY_URL,
                    release: app.getVersion(),
                    platform: os.platform(),
                    platform_version: os.release(),
                    arch: os.arch()
                })
            }
        })
    }

}
