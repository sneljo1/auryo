import { app } from 'electron'
import os from 'os'
import config from '../config'
import settings from './settings'
import { configureStore } from './store'
import Auryo from './app'

import { installExtensions } from './utils'

if (process.env.TOKEN) {
    process.env.ENV = 'test'
}

if (process.argv.some(arg => arg === '--development') || process.argv.some(arg => arg === '--dev')) {
    process.env.ENV = 'development'
}

const { init } = require('@sentry/electron')

const sendCrashReports = settings.get('app.crashReports')

if (sendCrashReports && process.env.NODE_ENV === 'production') {
    init({
        dsn: config.SENTRY_URL,
        release: app.getVersion(),
        platform: os.platform(),
        platform_version: os.release(),
        arch: os.arch()
    })
}

const store = configureStore()

const auryo = new Auryo(store)

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit()
})

app.on('activate', () => {
    if (auryo.mainWindow) {
        auryo.mainWindow.show()
    } else {
        // Something went wrong
        app.quit()
    }
})

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', () => {

    if (process.env.NODE_ENV === 'development') {
        installExtensions()
    }

    auryo.start()

})

