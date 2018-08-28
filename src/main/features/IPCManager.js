import { app, clipboard, ipcMain, shell } from 'electron';
import { download } from 'electron-dl';
import fs from 'fs';
import _ from 'lodash';
import io from 'socket.io-client';
import { CONFIG } from '../../config';
import { setLoginError, setLoginLoading } from '../../shared/actions/auth/auth.actions';
import { setToken } from '../../shared/actions/config.actions';
import { EVENTS } from '../../shared/constants/events';
import { registerError } from '../utils/raven';
import IFeature from './IFeature';

export default class IPCManager extends IFeature {

    register() {

        this.router.get(EVENTS.APP.VALID_DIR, (req, res) => {
            const path = decodeURIComponent(req.params.dir);

            fs.exists(path, (exists) => {
                res.json({ exists });
            });
        });

        ipcMain.on(EVENTS.APP.RESTART, () => {
            app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
            app.exit(0);
        });

        ipcMain.on(EVENTS.APP.OPEN_EXTERNAL, (event, arg) => {
            shell.openExternal(arg);
        })

        ipcMain.on(EVENTS.APP.WRITE_CLIPBOARD, (event, arg) => {
            clipboard.writeText(arg);
        });

        ipcMain.on(EVENTS.APP.DOWNLOAD_FILE, (event, url) => {
            const { config } = this.store.getState();

            const downloadSettings = {};

            if (!_.isEmpty(_.get(config, 'app.downloadPath'))) {
                downloadSettings.directory = config.app.downloadPath;
            }

            download(this.win, url, downloadSettings)
                .then(dl => console.log(dl.getSavePath()))
                .catch(console.error);
        });

        ipcMain.on(EVENTS.APP.AUTH.LOGIN, () => {
            this.store.dispatch(setLoginLoading());

            this.startLoginSocket();

            if (this.socket.connected) {
                this.login();
            } else {
                this.socket.on('connect', this.login);
            }

            if (this.socket && !this.socket.connected) {
                this.socket.connect();
            }

            // Set timeout for requests
            setTimeout(() => {
                const { auth: { authentication: { loading } } } = this.store.getState();

                if (loading) {
                    this.store.dispatch(setLoginError('Timed out, login took longer than expected'));
                    if (this.socket) {
                        this.socket.removeListener('connect', this.login);
                        this.socket.disconnect();
                    }
                }
            }, 8000);
        });
    }

    login = () => {
        shell.openExternal(CONFIG.getConnectUrl(this.socket.id));
        this.store.dispatch(setLoginLoading(false));
        this.socket.removeListener('connect', this.login);
    }

    startLoginSocket = () => {
        if (!this.socket) {
            this.socket = io(CONFIG.BASE_URL);

            this.socket.on('token', (data) => {
                this.store.dispatch(setToken(data));
                this.sendToWebContents('login-success')
            });

            this.socket.on('error', (err) => {
                this.store.dispatch(setLoginError(err.message));
                registerError(err);

                if (this.socket) {
                    this.socket.disconnect();
                }
            });
        }
    }
}
