import { Intent } from '@blueprintjs/core';
import { EVENTS } from '@common/constants/events';
import { addToast, setUpdateAvailable } from '@common/store/actions';
import axios from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, shell } from 'electron';
import * as is from 'electron-is';
import { autoUpdater } from 'electron-updater';
import { gt as isVersionGreaterThan, valid as parseVersion } from 'semver';
import { CONFIG } from '../../../config';
import { Logger, LoggerInstance } from '../../utils/logger';
import { Feature } from '../feature';
import { Auryo } from '@main/app';

export default class AppUpdater extends Feature {
  public readonly featureName = 'AppUpdater';
  private readonly logger: LoggerInstance = Logger.createLogger(this.featureName);

  private hasUpdate = false;
  private readonly currentVersion: string | null = parseVersion(app.getVersion());

  constructor(auryo: Auryo) {
    super(auryo, 'ready-to-show');
    autoUpdater.logger = this.logger;
  }

  public shouldRun() {
    return (
      !process.env.TOKEN &&
      process.env.NODE_ENV === 'production' &&
      !(process.platform === 'linux' && process.env.SNAP_USER_DATA != null)
    );
  }

  public register() {
    const timer = setTimeout(async () => {
      try {
        await this.update();
      } catch (err) {
        this.logger.error(err);
      }
    }, 10000);

    this.timers.push(timer);
  }

  public notify = (version: string) => {
    this.store.dispatch(setUpdateAvailable(version));

    this.store.dispatch(
      addToast({
        message: `Update available`,
        intent: Intent.SUCCESS
      })
    );
  };

  public update = async () => {
    if (is.linux()) {
      this.updateLinux();
    } else {
      autoUpdater.addListener('update-available', () => {
        this.hasUpdate = true;
        this.logger.info('New update available');
      });

      autoUpdater.addListener('update-downloaded', info => {
        this.notify(info.version);

        this.listenUpdate();
      });
      autoUpdater.addListener('error', error => {
        this.logger.error(error);
      });
      autoUpdater.addListener('checking-for-update', () => {
        this.logger.info('Checking for update');
      });
      autoUpdater.addListener('update-not-available', () => {
        this.logger.info('No update found');

        setTimeout(async () => {
          autoUpdater.checkForUpdates();
        }, 3600000);
      });
      autoUpdater.checkForUpdates();
    }
  };

  public listenUpdate = () => {
    this.on(EVENTS.APP.UPDATE, async () => {
      if (this.hasUpdate) {
        this.logger.info('Updating now!');

        try {
          if (is.linux()) {
            // tslint:disable-next-line: no-http-string
            await shell.openExternal('http://auryo.com#downloads');
          } else {
            autoUpdater.quitAndInstall(true, true);
          }
        } catch (err) {
          this.logger.error('Error during update', err);
        }
      }
    });
  };

  public updateLinux = () => {
    axios
      .get(CONFIG.UPDATE_SERVER_HOST)
      .then(res => res.data)
      .then(body => {
        if (!body || body.draft || !body.tag_name) {
          return;
        }
        const latest = parseVersion(body.tag_name);

        if (latest && this.currentVersion && isVersionGreaterThan(latest, this.currentVersion)) {
          this.logger.info('New update available');
          this.hasUpdate = true;

          this.notify(latest);

          this.listenUpdate();
        }
      })
      .catch(this.logger.error);
  };
}
