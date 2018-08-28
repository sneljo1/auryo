import { powerMonitor } from 'electron';
import { PLAYER_STATUS } from '../../shared/constants';
import { EVENTS } from '../../shared/constants/events';
import IFeature from './IFeature';

/**
 * Pause music on power down or sleep
 */
export default class PowerMonitor extends IFeature {

    shouldRun(){
        // ref: https://github.com/electron/electron/issues/13767
        return super.shouldRun() && !(process.platform === 'linux' && process.env.SNAP_USER_DATA != null)
    }

    register() {
        powerMonitor.on('suspend', this.pause);
    }

    pause = () => {
        this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.PAUSED)
    }

    unregister() {
        powerMonitor.removeListener('suspend', this.pause);
    }
}