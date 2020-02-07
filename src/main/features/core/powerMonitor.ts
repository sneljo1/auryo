import { PlayerStatus } from '@common/store/player';
import { toggleStatus } from '@common/store/actions';
// eslint-disable-next-line import/no-extraneous-dependencies
import { powerMonitor } from 'electron';
import { Feature } from '../feature';

/**
 * Pause music on power down or sleep
 */
export default class PowerMonitor extends Feature {
  public readonly featureName = 'PowerMonitor';
  public register() {
    powerMonitor.on('suspend', this.pause);
  }

  public pause = () => {
    this.store.dispatch(toggleStatus(PlayerStatus.PAUSED) as any);
  };

  public unregister() {
    powerMonitor.removeListener('suspend', this.pause);
  }
}
