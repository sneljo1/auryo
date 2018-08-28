import { ipcMain } from "electron";
import isEqual from 'lodash/isEqual';
import ReduxWatcher from 'redux-watcher';

export default class IFeature {

    waitUntil = 'default'

    listeners = []

    ipclisteners = []

    constructor(auryo) {
        this.win = auryo.mainWindow
        this.store = auryo.store
        this.app = auryo

        this.watcher = new ReduxWatcher(auryo.store)
    }

    subscribe(path, callback) {
        const listener = this.watcher.watch(path, callback)

        this.listeners.push({
            path,
            handler: listener
        })
    }

    sendToWebContents(channel, params) {
        if (this.win && this.win.webContents) {
            this.win.webContents.send(channel, params)
        }
    }

    on(path, callback) {
        ipcMain.on(path, (event, ...args) => {
            callback(args);
        });

        this.ipclisteners.push({
            name: path,
            handler: callback
        })
    }

    // eslint-disable-next-line
    register() { }

    /**
     * Unregister listener
     *
     * @param {Array} [path]
     */
    unregister(path) {

        if (path) {
            const listener = this.listeners.find(l => isEqual(l.path, path))
            const listenerIndex = this.listeners.findIndex(l => isEqual(l.path, path))

            if (listener && typeof listener.unsubscribe === 'function') {
                listener.unsubscribe()
                this.listeners.splice(listenerIndex)
            }
        } else {
            this.listeners.forEach(listener => {
                try {
                    this.watcher.off(listener.path, listener.handler)
                } catch (err) {
                    if (!err.message.startsWith('No such listener for')) {
                        throw err
                    }
                }
            })
        }


    }

    // eslint-disable-next-line
    shouldRun() {
        return true
    }
}