import { toggleStatus } from '@common/store/actions';
import { PlayerStatus } from '@common/store/player';
import { autobind } from 'core-decorators';
// eslint-disable-next-line import/no-extraneous-dependencies
import { powerMonitor } from 'electron';
import { Feature } from '../feature';

/**
 * Pause music on power down or sleep
 */
@autobind
export default class PowerMonitor extends Feature {
  public readonly featureName = 'PowerMonitor';
  public register() {
    powerMonitor.on('suspend', this.pause);
  }

  public pause() {
    this.store.dispatch(toggleStatus(PlayerStatus.PAUSED));
  }

  public unregister() {
    powerMonitor.removeListener('suspend', this.pause);
  }
}
