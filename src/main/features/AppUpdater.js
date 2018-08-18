import { ipcMain } from 'electron';
import is from 'electron-is';
import { autoUpdater } from 'electron-updater';
import request from 'request';
import { gt as isVersionGreaterThan, valid as parseVersion } from 'semver';
import { UPDATE_SERVER_HOST } from '../../config';
import Logger from '../utils/logger';
import { registerError } from '../utils/raven';
import IFeature from './IFeature';
import { appVersion } from '../../package.json'

console.log(autoUpdater.getDefaultChannelName())

export default class AppUpdater extends IFeature {

    cancelUpdate = null;

    currentVersion;

    constructor(auryo) {
        super(auryo);

        autoUpdater.channel = 'beta'
    }

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

        this.currentVersion = parseVersion(getVersion(appVersion));

        if (is.linux() || is.macOS()) {
            this.updateLinux();
        } else {


            autoUpdater.addListener('update-available', () => {
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
            autoUpdater.addListener('checking-for-update', () => {
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

            ipcMain.on('do-update', () => {
                if (this.has_update) {
                    Logger.info('Updating now!');
                    autoUpdater.quitAndInstall(true, true);
                }
            });

        }

    }

    updateLinux() {
        request({
            url: UPDATE_SERVER_HOST, headers: {
                'User-Agent': 'request'
            }
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const obj = JSON.parse(body);
                if (!obj || obj.draft || !obj.tag_name) return;
                const latest = parseVersion(obj.tag_name);

                if (isVersionGreaterThan(latest, this.currentVersion)) {
                    Logger.info('New update available');

                    this.win.webContents.send('update-status', {
                        status: 'update-available-linux',
                        version: latest,
                        currentVersion: this.currentVersion,
                        url: 'http://auryo.com#downloads'
                    });
                }
            } else {
                registerError(error);
            }
        });
    }
}