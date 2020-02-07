import { EVENTS } from '@common/constants/events';
import { canGoInHistory } from '@common/store/app/actions';
import { Config } from '@common/store/config';
import { setConfig } from '@common/store/config/actions';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app, session } from 'electron';
import _ from 'lodash';
import isDeepEqual from 'react-fast-compare';
import { show } from 'redux-modal';
import * as semver from 'semver';
import { CONFIG } from '../../../config';
import { Auryo } from '../../app';
import { settings } from '../../settings';
import { Logger, LoggerInstance } from '../../utils/logger';
import { Utils } from '../../utils/utils';
import { Feature, WatchState } from '../feature';

export default class ConfigManager extends Feature {
  public readonly featureName = 'ConfigManager';
  private readonly logger: LoggerInstance = Logger.createLogger(this.featureName);
  private isNewVersion = false;
  private isNewUser = false;

  private readonly writetoConfig: (config: Config) => void;
  private config: Config = CONFIG.DEFAULT_CONFIG;

  constructor(auryo: Auryo) {
    super(auryo);

    this.writetoConfig = _.debounce(
      (config: Config) => {
        if (!isDeepEqual(settings.store, config)) {
          settings.set(config as any);
        }
      },
      250,
      {
        leading: true
      }
    );
  }

  public async register() {
    try {
      this.config = settings.store as any;
    } catch (e) {
      this.config = CONFIG.DEFAULT_CONFIG;
    }

    if (this.config.version === undefined) {
      this.config.version = app.getVersion();
      this.isNewUser = true;
    } else if (semver.lt(this.config.version, app.getVersion())) {
      this.config.version = app.getVersion();
      this.isNewVersion = true;
    }

    // fill out default values if config is incomplete
    this.config = _.defaultsDeep(this.config, CONFIG.DEFAULT_CONFIG);

    if (this.config.enableProxy && this.config.proxy.host) {
      this.logger.info('Enabling proxy');

      if (session.defaultSession) {
        await session.defaultSession.setProxy({
          proxyRules: Utils.getProxyUrlFromConfig(this.config.proxy),
          pacScript: '',
          proxyBypassRules: ''
        });

        if (session.defaultSession) {
          const proxy = await session.defaultSession.resolveProxy('https://api.soundcloud.com');

          this.logger.info(`Proxy status: ${proxy}`);

          if (!proxy && session.defaultSession) {
            await session.defaultSession.setProxy({
              proxyRules: '',
              pacScript: '',
              proxyBypassRules: ''
            });

            this.logger.error('Failed to initialize proxy');
          }
        }
      }
    }

    this.writetoConfig(this.config);
    this.store.dispatch(setConfig(this.config));

    this.on(EVENTS.APP.READY, () => {
      this.notifyNewVersion();
      this.on(EVENTS.APP.NAVIGATE, this.checkCanGo);
      this.subscribe(['config'], this.updateConfig);
    });
  }

  /**
   * Write new values to the config file
   */
  public updateConfig = ({ currentValue }: WatchState<Config>) => {
    this.writetoConfig(currentValue);
  };

  /**
   * On route change, check if can Go from browser webcontents
   */
  public checkCanGo = () => {
    if (this.win && this.win.webContents) {
      const back = this.win.webContents.canGoBack();
      const next = this.win.webContents.canGoForward();

      this.store.dispatch(canGoInHistory({ back, next }));
    }
  };

  /**
   * If version doesn't match config version, send update to frontend on app loaded
   */
  public notifyNewVersion = () => {
    if (this.isNewVersion && !this.isNewUser && !process.env.TOKEN) {
      setTimeout(() => {
        this.store.dispatch(show('changelog', { version: app.getVersion() }));
        super.unregister(['app', 'loaded']);
      }, 5000);
    }
  };
}
