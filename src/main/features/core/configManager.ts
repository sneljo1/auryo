import { Config } from '@common/store/config';
import { setConfig } from '@common/store/config/actions';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app } from 'electron';
import _ from 'lodash';
import * as semver from 'semver';
import { CONFIG } from '../../../config';
import { settings } from '../../settings';
import { Feature } from '../feature';

export default class ConfigManager extends Feature {
  public readonly featureName = 'ConfigManager';

  private config: Config = CONFIG.DEFAULT_CONFIG;

  public async register() {
    try {
      this.config = settings.store as any;
    } catch (e) {
      this.config = CONFIG.DEFAULT_CONFIG;
    }

    if (this.config.version === undefined) {
      this.config.version = app.getVersion();
    } else if (semver.lt(this.config.version, app.getVersion())) {
      this.config.version = app.getVersion();
    }

    // fill out default values if config is incomplete
    this.config = _.defaultsDeep(this.config, CONFIG.DEFAULT_CONFIG);

    this.store.dispatch(setConfig(this.config));
  }
}
