import { globalShortcut } from 'electron';
import IFeature from './feature';
import { EVENTS } from '../../common/constants/events';
import { ChangeTypes, PlayerStatus } from '../../common/store/player';
import { Auryo } from '../app';

/**
 * Register global media shortcuts
 */
export default class Shortcut extends IFeature {
  constructor(app: Auryo) {
    super(app, 'ready');
  }
  register() {
    globalShortcut.register('MediaPlayPause', () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS);
    });
    globalShortcut.register('MediaPreviousTrack', () => {
      this.changeTrack(ChangeTypes.PREV);
    });
    globalShortcut.register('MediaNextTrack', () => {
      this.changeTrack(ChangeTypes.NEXT);
    });
    globalShortcut.register('MediaStop', () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PlayerStatus.STOPPED);
    });
  }

  unregister() {
    globalShortcut.unregisterAll();
  }

  changeTrack = (changeType: ChangeTypes) => {
    this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, changeType);
  }
}
