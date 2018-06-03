import { ipcMain } from 'electron';
import { gt as isVersionGreaterThan, valid as parseVersion } from 'semver';
import { UPDATE_SERVER_HOST } from '../../config';
import is from 'electron-is';
import request from 'request';
import { autoUpdater } from 'electron-updater';
import IFeature from './IFeature';
import Logger from '../utils/logger';
import { registerError } from '../utils/raven';

export default class AppUpdater extends IFeature {

    cancelUpdate = null;
    currentVersion;

    register() {
        if (!process.env.TOKEN && process.env.NODE_ENV === 'production') {
            this.cancelUpdate = setTimeout(() => {
                this.update();
            }, 5000);
        }
    }

    unregister() {
        if (this.cancelUpdate && typeof this.cancelUpdate === 'function') {
            this.cancelUpdate();
        }
    }

    update() {

        function getVersion(version) {
            const regex = /[0-9]+\.[0-9]+\.[0-9]+/g;
            return regex.exec(version)[0];

        }

        this.currentVersion = parseVersion(getVersion(require('../../package.json').version));

        if (is.linux() || is.macOS()) {
            this.updateLinux();
        } else {


            autoUpdater.addListener('update-available', (event) => {
                this.has_update = true;
                Logger.info('New update available');
            });
            autoUpdater.addListener('update-downloaded', (info) => {
                this.win.webContents.send('update-status', {
                    status: 'update-available',
                    version: info.version,
                    current_version: this.currentVersion
                });

            });
            autoUpdater.addListener('error', (error) => {
                registerError(error);
            });
            autoUpdater.addListener('checking-for-update', (event) => {
                Logger.info('Checking for update');
            });
            autoUpdater.addListener('update-not-available', () => {
                Logger.info('No update found');
                setTimeout(() => {
                    autoUpdater.checkForUpdates();
                }, 300000);
            });

            if (this.platform === 'darwin') {
                autoUpdater.setFeedURL(`https://${UPDATE_SERVER_HOST}/update/darwin?version=${this.currentVersion}`);
            }

            autoUpdater.checkForUpdates();

            ipcMain.on('do-update', (event, arg) => {
                if (this.has_update) {
                    Logger.info('Updating now!');
                    autoUpdater.quitAndInstall(true, true);
                }
            });

        }

    }

    updateLinux() {
        const win = this.win;
        const current_version = this.currentVersion;

        request({
            url: UPDATE_SERVER_HOST, headers: {
                'User-Agent': 'request'
            }
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                const obj = JSON.parse(body);
                if (!obj || obj.draft || !obj.tag_name) return;
                const latest = parseVersion(obj.tag_name);

                if (isVersionGreaterThan(latest, current_version)) {
                    Logger.info('New update available');

                    win.webContents.send('update-status', {
                        status: 'update-available-linux',
                        version: latest,
                        current_version: current_version,
                        url: 'http://auryo.com#downloads'
                    });
                }
            } else {
                registerError(error);
            }
        });
    }
}