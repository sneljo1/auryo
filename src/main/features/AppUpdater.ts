import { app, shell } from 'electron';
import * as is from 'electron-is';
import { autoUpdater } from 'electron-updater';
import * as request from 'request';
import { gt as isVersionGreaterThan, valid as parseVersion } from 'semver';
import { CONFIG } from '../../config';
import { EVENTS } from '../../common/constants/events';
import { Logger } from '../utils/logger';
import Feature from './feature';
import { setUpdateAvailable } from '../../common/store/app';
import { addToast } from '../../common/store/ui';
import { Intent } from '@blueprintjs/core';

export default class AppUpdater extends Feature {
  private logger = new Logger('AppUpdater');

  private hasUpdate = false;
  private currentVersion = parseVersion(app.getVersion());

  // eslint-disable-next-line
  shouldRun() {
    return !process.env.TOKEN && process.env.NODE_ENV === 'production' && !(process.platform === 'linux' && process.env.SNAP_USER_DATA != null);
  }

  register() {
    const timer = setTimeout(() => {
      this.update();
    }, 10000);

    this.timers.push(timer);
  }

  notify = (version: string) => {
    this.store.dispatch(setUpdateAvailable(version));

    this.store.dispatch(addToast({
      message: `Update available`,
      intent: Intent.SUCCESS
    }));
  }

  update = () => {
    if (is.linux() || is.macOS()) {
      this.updateLinux();
    } else {
      autoUpdater.addListener('update-available', () => {
        this.hasUpdate = true;
        this.logger.info('New update available');
      });

      autoUpdater.addListener('update-downloaded', (info) => {
        this.notify(info.version);

        this.listenUpdate();
      });
      autoUpdater.addListener('error', (error) => {
        this.logger.error(error);
      });
      autoUpdater.addListener('checking-for-update', () => {
        this.logger.info('Checking for update');
      });
      autoUpdater.addListener('update-not-available', () => {
        this.logger.info('No update found');

        setTimeout(() => {
          autoUpdater.checkForUpdates();
        }, 300000);
      });

      // if (this.platform === 'darwin') {
      //     autoUpdater.setFeedURL(`https://${CONFIG.UPDATE_SERVER_HOST}/update/darwin?version=${this.currentVersion}`);
      // }

      autoUpdater.checkForUpdates();
    }
  }

  listenUpdate = () => {
    this.on(EVENTS.APP.UPDATE, () => {
      if (this.hasUpdate) {
        this.logger.info('Updating now!');

        if (is.linux() || is.macOS()) {
          shell.openExternal('http://auryo.com#downloads');
        } else {
          autoUpdater.quitAndInstall(true, true);
        }
      }
    });
  }

  updateLinux = () => {
    request(
      {
        url: CONFIG.UPDATE_SERVER_HOST,
        headers: {
          'User-Agent': 'request'
        }
      },
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          const obj = JSON.parse(body);
          if (!obj || obj.draft || !obj.tag_name) { return; }
          const latest = parseVersion(obj.tag_name);

          if (latest && this.currentVersion && isVersionGreaterThan(latest, this.currentVersion)) {
            this.logger.info('New update available');
            this.hasUpdate = true;

            this.notify(latest);

            this.listenUpdate();
          }
        } else {
          this.logger.error(error);
        }
      }
    );
  }
}
