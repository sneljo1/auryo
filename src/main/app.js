import { app, BrowserWindow, Menu, nativeImage, shell } from 'electron';
import windowStateKeeper from 'electron-window-state';
import os from 'os';
import path from 'path';
import { CONFIG } from '../config';
import { posCenter } from './utils';
import { Logger } from './utils/logger';
import { groupBy } from './utils/utils';

const Router = require('electron-router')

if (process.env.NODE_ENV === 'development') {
    require('electron-debug')() // eslint-disable-line global-require
    const p = path.join(__dirname, '..', 'app', 'node_modules') // eslint-disable-line
    require('module').globalPaths.push(p) // eslint-disable-line
}

let logosPath

if (process.env.NODE_ENV === 'development') {
    logosPath = path.resolve(__dirname, '..', '..', '..', 'assets', 'img', 'logos')
} else {
    logosPath = path.resolve(__dirname, './assets/img/logos')
}

const icons = {
    '256': nativeImage.createFromPath(path.join(logosPath, 'auryo.png')),
    '128': nativeImage.createFromPath(path.join(logosPath, 'auryo-128.png')),
    '64': nativeImage.createFromPath(path.join(logosPath, 'auryo-64.png')),
    '48': nativeImage.createFromPath(path.join(logosPath, 'auryo-48.png')),
    '32': nativeImage.createFromPath(path.join(logosPath, 'auryo-32.png')),
    'ico': nativeImage.createFromPath(path.join(logosPath, 'auryo.ico')),
    'tray': nativeImage.createFromPath(path.join(logosPath, 'auryo-tray.png')).resize({ width: 24, height: 24 }),
    'tray-ico': nativeImage.createFromPath(path.join(logosPath, 'auryo-tray.ico')).resize({ width: 24, height: 24 })
}

export default class Auryo {

    constructor(store) {
        this.store = store
        this.router = Router('MAIN')
        this.quitting = false

        app.setAppUserModelId('com.auryo.core')

        // Make the app a single-instance app
        const shouldQuit = app.makeSingleInstance(() => {
            if (this.mainWindow) {
                if (this.mainWindow.isMinimized()) this.mainWindow.restore()
                this.mainWindow.focus()
                this.mainWindow.show()
                this.mainWindow.setSkipTaskbar(false)
                if (app.dock && app.dock.show) app.dock.show()
            }
        })

        if (shouldQuit) {
            app.exit()
        }
    }

    start() {

        Logger.profile('app-start')

        const mainWindowState = windowStateKeeper({
            defaultWidth: 1190,
            defaultHeight: 728
        })

        // Browser Window options
        const mainWindowOption = {
            title: 'Auryo',
            icon: os.platform() === 'win32' ? icons.ico : icons['256'],
            x: mainWindowState.x,
            y: mainWindowState.y,
            width: mainWindowState.width,
            height: mainWindowState.height,
            minWidth: 950,
            minHeight: 400,
            titleBarStyle: 'hiddenInset',
            show: false,
            fullscreen: mainWindowState.isFullScreen,
            webPreferences: {
                nodeIntegrationInWorker: true

            }
        }

        // Create the browser window
        this.mainWindow = new BrowserWindow(posCenter(mainWindowOption))

        this.registerTools()

        mainWindowState.manage(this.mainWindow)

        this.mainWindow.setMenu(null)

        this.loadMain()

        this.mainWindow.on('closed', () => {
            this.mainWindow = null
        })

        app.on('before-quit', () => {
            Logger.info('Application exiting...')
            this.quitting = true
        })

        this.mainWindow.on('close', (event) => {
            if (process.platform === 'darwin') {
                if (this.quitting) {
                    this.mainWindow = null
                } else {
                    event.preventDefault()
                    this.mainWindow.hide()
                }
            }
        })

        this.mainWindow.on('ready-to-show', () => {
            this.mainWindow.show()
        })

        if (process.env.NODE_ENV === 'development' || process.env.ENV === 'development') {
            this.mainWindow.webContents.on('context-menu', (e, props) => {
                const { x, y } = props
                Menu.buildFromTemplate([{
                    label: 'Inspect element',
                    click: () => {
                        this.mainWindow.inspectElement(x, y)
                    }
                },
                {
                    label: 'Reload',
                    click: () => {
                        this.mainWindow.reload()
                    }
                }
                ]).popup(this.mainWindow)
            })
        }

        Logger.profile('app-start')
        Logger.info('App started')

    }

    registerTools() {
        const { getTools } = require('./features') // eslint-disable-line

        const eventFeatures = groupBy(getTools(this), 'waitUntil')


        Object.keys(eventFeatures)
            .forEach(event => {
                const features = eventFeatures[event]

                features.forEach((feature) => {
                    if (event === 'default') {
                        feature.register()
                    } else {
                        app.on(event, feature.register)
                    }
                })
            })
    }

    loadMain() {
        this.mainWindow.loadURL(CONFIG.MAIN_WINDOW)

        this.mainWindow.webContents.on('will-navigate', (e, u) => {
            e.preventDefault()

            if (/^(https?:\/\/)/g.exec(u) !== null) {
                if (/https?:\/\/(www.)?soundcloud\.com\//g.exec(u) !== null) {
                    this.mainWindow.webContents.send('navigate', {
                        pathname: '/resolve',
                        search: '',
                        hash: '',
                        action: 'PUSH',
                        key: 'resolve',
                        query: {
                            url: escape(u)
                        }
                    })
                } else {
                    shell.openExternal(u)
                }
            } else if (/^mailto:/g.exec(u) !== null) {
                shell.openExternal(u)
            }
        })
        this.mainWindow.webContents.on('new-window', (e, u) => {
            e.preventDefault()
            if (/^(https?:\/\/)/g.exec(u) !== null) {
                shell.openExternal(u)
            }
        })

        this.mainWindow.webContents.on('did-get-response-details', (e, status, newURL, originalURL, httpResponseCode) => {
            if (newURL.indexOf('/stream?client_id=') !== -1 || newURL.indexOf('https://cf-media.sndcdn.com/') !== -1) {
                this.mainWindow.webContents.send('stream-request')

                if (httpResponseCode < 200 && httpResponseCode > 300) {
                    this.mainWindow.webContents.send('stream-error', httpResponseCode, newURL)
                }
            }

        })

        this.mainWindow.webContents.session.webRequest.onErrorOccurred({ urls: ['*/stream?client_id=*'] }, (details) => {
            if (details.error === 'net::ERR_INTERNET_DISCONNECTED') {
                this.mainWindow.webContents.send('stream-error', -1)

            }
        })
    }
}