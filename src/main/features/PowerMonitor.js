import IFeature from './IFeature';
import { PLAYER_STATUS } from '../../shared/constants';
import { powerMonitor } from 'electron';
import { EVENTS } from '../../shared/constants/events';

/**
 * Pause music on power down or sleep
 */
export default class PowerMonitor extends IFeature {

    constructor(app) {
        super(app);

        this.pause = this.pause.bind(this);
    }

    register() {
        powerMonitor.on('suspend', this.pause);
    }

    pause() {
        if (!this.app.mainWindow) {
            this.router.send(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.PAUSED);
        }
    }

    unregister() {
        powerMonitor.removeListener('suspend', this.pause);
    }
}