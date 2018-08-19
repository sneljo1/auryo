import { globalShortcut } from 'electron';
import { CHANGE_TYPES, PLAYER_STATUS } from '../../shared/constants';
import IFeature from './IFeature';
import { EVENTS } from '../../shared/constants/events';

/**
 * Register global media shortcuts
 */
export default class Shortcut extends IFeature {

    register() {
        globalShortcut.register('MediaPlayPause', () => {
            this.router.send(EVENTS.PLAYER.TOGGLE_STATUS);
        });
        globalShortcut.register('MediaPreviousTrack', () => {
            this.changeTrack(CHANGE_TYPES.PREV);
        });
        globalShortcut.register('MediaNextTrack', () => {
            this.changeTrack(CHANGE_TYPES.NEXT);
        });
        globalShortcut.register('MediaNextTrack', () => {
            this.changeTrack(CHANGE_TYPES.NEXT);
        });
        globalShortcut.register('MediaStop', () => {
            this.win.webContents.send('player:toggle-status', PLAYER_STATUS.STOPPED);
        });
    }

    // eslint-disable-next-line
    unregister() {
        globalShortcut.unregisterAll();
    }

    changeTrack = (changeType) => {
        this.router.send(EVENTS.PLAYER.CHANGE_TRACK, changeType);
    }
}