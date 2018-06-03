import Logger from './logger'
import settings from '../settings'

export const registerError = (err, ui) => {
    Logger.error(ui ? err.stack : err)

    const sendCrashReports = settings.get('app.crashReports')
}