import { app, session } from 'electron';
import * as _ from 'lodash';
import { show } from 'redux-modal';
import * as semver from 'semver';
import { CONFIG } from '../../config';
import { EVENTS } from '../../shared/constants/events';
import { canGoInHistory } from '../../shared/store/app/actions';
import { Config } from '../../shared/store/config';
import { setConfig } from '../../shared/store/config/actions';
import { Auryo } from '../app';
import { settings } from '../settings';
import { Logger } from '../utils/logger';
import { Utils } from '../utils/utils';
import Feature, { WatchState } from './feature';

export default class ConfigManager extends Feature {
  private logger = new Logger('ConfigManager');

  private isNewVersion = false;
  private isNewUser = false;

  private writetoConfig: Function;
  private config: Config;

  constructor(auryo: Auryo) {
    super(auryo);

    this.writetoConfig = _.debounce((config) => settings.setAll(config), 250);
  }

  register() {
    try {
      this.config = settings.getAll() as any;
    } catch (e) {
      this.config = CONFIG.DEFAULT_CONFIG;
    }

    if (typeof this.config.version === 'undefined') {
      this.config.version = app.getVersion();
      this.isNewUser = true;
    } else if (semver.lt(this.config.version, app.getVersion())) {
      this.config.version = app.getVersion();
      this.isNewVersion = true;
    }

    // fill out default values if config is incomplete
    this.config = _.defaultsDeep(this.config, CONFIG.DEFAULT_CONFIG);

    if (this.config.enableProxy) {
      this.logger.info('Enabling proxy');

      if (session.defaultSession) {
        session.defaultSession.setProxy(
          {
            proxyRules: Utils.getProxyUrlFromConfig(this.config.proxy),
            pacScript: '',
            proxyBypassRules: ''
          },
          () => {
            if (session.defaultSession) {
              session.defaultSession.resolveProxy('https://api.soundcloud.com', (proxy) => {
                this.logger.info('Proxy status: ', proxy);

                if (!proxy && session.defaultSession) {
                  session.defaultSession.setProxy(
                    {
                      proxyRules: '',
                      pacScript: '',
                      proxyBypassRules: ''
                    },
                    () => {
                      this.logger.error('Failed to initialize proxy');
                    }
                  );
                }
              });
            }
          }
        );
      }
    }

    this.writetoConfig(this.config);
    this.store.dispatch(setConfig(this.config));

    this.on(EVENTS.APP.READY, () => {
      this.notifyNewVersion();
      this.notifyNewUser();
      console.log("READY")
      this.on(EVENTS.APP.NAVIGATE, this.checkCanGo);
      this.subscribe(['config'], this.updateConfig);
    });
  }

  /**
   * Write new values to the config file
   */
  updateConfig = ({ currentValue }: WatchState<Config>) => {
    this.writetoConfig(currentValue);
  }

  /**
   * On route change, check if can Go from browser webcontents
   */
  checkCanGo = () => {
    console.log("NAVIGATE")
    if (this.win && this.win.webContents) {
      const back = this.win.webContents.canGoBack();
      const next = this.win.webContents.canGoForward();

      this.store.dispatch(canGoInHistory({ back, next }));
    }
  }

  /**
   * If version doesn't match config version, send update to frontend on app loaded
   */
  notifyNewVersion = () => {
    if (this.isNewVersion && !this.isNewUser && !process.env.TOKEN) {
      setTimeout(() => {
        this.store.dispatch(show('changelog', { version: app.getVersion() }));
        super.unregister(['app', 'loaded']);
      }, 5000);
    }
  }

  notifyNewUser = () => {
    if (this.isNewUser && !process.env.TOKEN) {
      setTimeout(() => {
        this.store.dispatch(show('welcome', {}));
      }, 5000);
    }
  }
}
