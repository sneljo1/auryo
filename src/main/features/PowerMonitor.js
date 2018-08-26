import { powerMonitor } from 'electron';
import { PLAYER_STATUS } from '../../shared/constants';
import { EVENTS } from '../../shared/constants/events';
import IFeature from './IFeature';

/**
 * Pause music on power down or sleep
 */
export default class PowerMonitor extends IFeature {

    register() {
        powerMonitor.on('suspend', this.pause);
    }

    pause = () => {
        this.router.send(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.PAUSED);
    }

    unregister() {
        powerMonitor.removeListener('suspend', this.pause);
    }
}