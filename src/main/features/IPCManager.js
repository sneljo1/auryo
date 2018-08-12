import { ipcMain, shell } from 'electron'
import IFeature from './IFeature'
import { setToken } from '../../shared/actions/config.actions'
import { BASE_URL, getConnectUrl } from '../../config'
import io from 'socket.io-client'
import { registerError } from '../utils/raven'
import { setLoginError, setLoginLoading } from '../../shared/actions/auth/auth.actions'
import { EVENTS } from '../../shared/constants/events'
import { download } from 'electron-dl'

const { app, clipboard } = require('electron')

export default class IPCManager extends IFeature {

    socket

    register() {

        this.on(EVENTS.APP.RESTART, () => {
            app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
            app.exit(0)
        })

        ipcMain.on('open_external', (event, arg) => {
            shell.openExternal(arg)
        })

        ipcMain.on('write_clipboard', (event, arg) => {
            clipboard.writeText(arg)
        })

        ipcMain.on('download_file', (event, url) => {
            download(this.win, url)
                .then(dl => console.log(dl.getSavePath()))
                .catch(console.error);
        })

        ipcMain.on('error', (event, arg) => {
            let error = arg

            try {
                error = JSON.parse(error)
            } catch (e) {

            }
            registerError(error, true)
        })

        ipcMain.on('login', (event, arg) => {
            const _this = this

            this.store.dispatch(setLoginLoading())

            this.startLoginSocket()

            if (this.socket.connected) {
                login()
            } else {
                this.socket.on('connect', login)
            }

            function login() {
                shell.openExternal(getConnectUrl(_this.socket.id))
                _this.store.dispatch(setLoginLoading(false))
                _this.socket.removeListener('connect', login)
            }

            if (this.socket && !this.socket.connected) {
                this.socket.connect()
            }

            // Set timeout for requests
            setTimeout(() => {
                const { auth: { authentication: { loading } } } = _this.store.getState()

                if (loading) {
                    _this.store.dispatch(setLoginError('Timed out, login took longer than expected'))
                    if (_this.socket) {
                        _this.socket.removeListener('connect', login)
                        _this.socket.disconnect()
                    }
                }

            }, 8000)
        })
    }


    startLoginSocket() {
        const _this = this

        if (!this.socket) {
            this.socket = io(BASE_URL)

            this.socket.on('token', function (data) {
                _this.store.dispatch(setToken(data))
                _this.win.webContents.send('login-success')
            })

            this.socket.on('error', function (err) {

                _this.store.dispatch(setLoginError(err.message))

                registerError(err)

                if (this.socket) {
                    this.socket.disconnect()
                }

            })
        }
    }

    unregister() {
    }
}

