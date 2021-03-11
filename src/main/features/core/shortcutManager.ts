import { changeTrack, toggleStatus } from '@common/store/actions';
import { ChangeTypes, PlayerStatus } from '@common/store/player';
// eslint-disable-next-line import/no-extraneous-dependencies
import { globalShortcut } from 'electron';
import is from 'electron-is';
import { Auryo } from '../../app';
import { Feature } from '../feature';

/**
 * Register global media shortcuts
 */
export default class Shortcut extends Feature {
  public readonly featureName = 'Shortcut';
  constructor(auryo: Auryo) {
    super(auryo, 'ready-to-show');
  }

  shouldRun() {
    return !is.macOS(); // For Mac this is handled in mediaservicemanager
  }

  public register() {
    globalShortcut.register('MediaPlayPause', () => {
      this.store.dispatch(toggleStatus());
    });
    globalShortcut.register('MediaPreviousTrack', () => {
      this.store.dispatch(changeTrack(ChangeTypes.PREV));
    });
    globalShortcut.register('MediaNextTrack', () => {
      this.store.dispatch(changeTrack(ChangeTypes.NEXT));
    });
    globalShortcut.register('MediaStop', () => {
      this.store.dispatch(toggleStatus(PlayerStatus.STOPPED));
    });
  }

  public unregister() {
    globalShortcut.unregisterAll();
  }
}
