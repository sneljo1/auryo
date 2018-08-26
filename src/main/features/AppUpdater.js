import { shell, app } from 'electron';
import is from 'electron-is';
import { autoUpdater } from 'electron-updater';
import request from 'request';
import { gt as isVersionGreaterThan, valid as parseVersion } from 'semver';
import { CONFIG } from '../../config';
import { EVENTS } from '../../shared/constants/events';
import { Logger } from '../utils/logger';
import { registerError } from '../utils/raven';
import IFeature from './IFeature';

export default class AppUpdater extends IFeature {

    // eslint-disable-next-line
    shouldRun() {
        return !process.env.TOKEN && process.env.NODE_ENV === 'production'
    }

    cancelUpdate = null;

    has_update = false;

    currentVersion;

    register() {
        this.cancelUpdate = setTimeout(() => {
            this.update();
        }, 10000);
    }

    unregister() {
        if (this.cancelUpdate && typeof this.cancelUpdate === 'function') {
            this.cancelUpdate();
        }
    }

    update = () => {

        this.currentVersion = parseVersion(app.getVersion());

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

                this.listenUpdate();

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
                autoUpdater.setFeedURL(`https://${CONFIG.UPDATE_SERVER_HOST}/update/darwin?version=${this.currentVersion}`);
            }

            autoUpdater.checkForUpdates();

        }

    }

    listenUpdate = () => {
        this.on(EVENTS.APP.UPDATE, () => {
            if (this.has_update) {
                Logger.info('Updating now!');

                if (is.linux() || is.macOS()) {
                    shell.openExternal("http://auryo.com#downloads")
                } else {
                    autoUpdater.quitAndInstall(true, true);
                }
            }
        })
    }

    updateLinux = () => {
        request({
            url: CONFIG.UPDATE_SERVER_HOST, headers: {
                'User-Agent': 'request'
            }
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const obj = JSON.parse(body);
                if (!obj || obj.draft || !obj.tag_name) return;
                const latest = parseVersion(obj.tag_name);

                if (isVersionGreaterThan(latest, this.currentVersion)) {
                    Logger.info('New update available');
                    this.has_update = true;

                    this.win.webContents.send('update-status', {
                        status: 'update-available-linux',
                        version: latest,
                        currentVersion: this.currentVersion,
                        url: 'http://auryo.com#downloads'
                    });

                    this.listenUpdate();

                }
            } else {
                registerError(error);
            }
        });
    }
}