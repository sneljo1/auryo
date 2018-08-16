import io from 'socket.io-client';
import { download } from 'electron-dl';
import _ from 'lodash';
import { ipcMain, shell, app, clipboard } from 'electron';
import fs from 'fs';
import IFeature from './IFeature';
import { setToken } from '../../shared/actions/config.actions';
import { BASE_URL, getConnectUrl } from '../../config';
import { registerError } from '../utils/raven';
import { setLoginError, setLoginLoading } from '../../shared/actions/auth/auth.actions';
import { EVENTS } from '../../shared/constants/events';

export default class IPCManager extends IFeature {

    register() {
        this.on(EVENTS.APP.RESTART, () => {
            app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
            app.exit(0);
        });

        this.router.get(EVENTS.APP.VALID_DIR, (req, res) => {
            const path = req.params[0];

            fs.exists(path, (exists) => {
                res.json(null, { exists });
            });
        });

        ipcMain.on('open_external', (event, arg) => {
            shell.openExternal(arg);
        });

        ipcMain.on('write_clipboard', (event, arg) => {
            clipboard.writeText(arg);
        });

        ipcMain.on('download_file', (event, url) => {
            const { config } = this.store.getState();

            const downloadSettings = {};

            console.log(url)

            if (!_.isEmpty(_.get(config, 'app.downloadPath'))) {
                downloadSettings.directory = config.app.downloadPath;
            }

            console.log(downloadSettings.directory)

            download(this.win, url, downloadSettings)
                .then(dl => console.log(dl.getSavePath()))
                .catch(console.error);
        });

        ipcMain.on('error', (event, arg) => {
            let error = arg;

            try {
                error = JSON.parse(error);
            } catch (e) {

            }
            registerError(error, true);
        });

        ipcMain.on('login', (event) => {
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
        shell.openExternal(getConnectUrl(this.socket.id));
        this.store.dispatch(setLoginLoading(false));
        this.socket.removeListener('connect', this.login);
    }

    startLoginSocket = () => {
        if (!this.socket) {
            this.socket = io(BASE_URL);

            this.socket.on('token', (data) => {
                this.store.dispatch(setToken(data));
                this.win.webContents.send('login-success');
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
