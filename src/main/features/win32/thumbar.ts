import { changeTrack, toggleStatus } from '@common/store/actions';
import { ChangeTypes, PlayerStatus } from '@common/store/player';
import { getQueuePlaylistSelector } from '@common/store/selectors';
import { StoreState } from 'AppReduxTypes';
import { autobind } from 'core-decorators';
// eslint-disable-next-line import/no-extraneous-dependencies
import { nativeImage } from 'electron';
import is from 'electron-is';
import * as path from 'path';
import { Auryo } from '../../app';
import { Feature } from '../feature';

const iconsDirectory = path.resolve(global.__static, 'icons');

interface ThumbarPreset {
  play: Electron.ThumbarButton;
  playDisabled: Electron.ThumbarButton;
  pause: Electron.ThumbarButton;
  pauseDisabled: Electron.ThumbarButton;
  prev: Electron.ThumbarButton;
  prevDisabled: Electron.ThumbarButton;
  next: Electron.ThumbarButton;
  nextDisabled: Electron.ThumbarButton;
}

@autobind
export default class Thumbar extends Feature {
  public readonly featureName = 'Thumbar';
  private thumbarButtons: ThumbarPreset | null = null;

  constructor(auryo: Auryo) {
    super(auryo, 'focus');
  }

  public shouldRun() {
    return is.windows();
  }

  public register() {
    this.thumbarButtons = {
      play: {
        tooltip: 'Play',
        icon: nativeImage.createFromPath(path.join(iconsDirectory, 'play.png')),
        click: () => {
          this.store.dispatch(toggleStatus(PlayerStatus.PLAYING));
        }
      },
      playDisabled: {
        tooltip: 'Play',
        flags: ['disabled'],
        icon: nativeImage.createFromPath(path.join(iconsDirectory, 'play-disabled.png')),
        // tslint:disable-next-line:no-empty
        click: () => {}
      },
      pause: {
        tooltip: 'Pause',
        icon: nativeImage.createFromPath(path.join(iconsDirectory, 'pause.png')),
        click: () => {
          this.store.dispatch(toggleStatus(PlayerStatus.PAUSED));
        }
      },
      pauseDisabled: {
        tooltip: 'Pause',
        flags: ['disabled'],
        icon: nativeImage.createFromPath(path.join(iconsDirectory, 'pause-disabled.png')),
        // tslint:disable-next-line:no-empty
        click: () => {}
      },
      prev: {
        tooltip: 'Prev',
        icon: nativeImage.createFromPath(path.join(iconsDirectory, 'previous.png')),
        click: () => {
          this.store.dispatch(changeTrack(ChangeTypes.PREV));
        }
      },
      prevDisabled: {
        tooltip: 'Prev',
        flags: ['disabled'],
        icon: nativeImage.createFromPath(path.join(iconsDirectory, 'previous-disabled.png')),
        // tslint:disable-next-line:no-empty
        click: () => {}
      },
      next: {
        tooltip: 'Next',
        icon: nativeImage.createFromPath(path.join(iconsDirectory, 'next.png')),
        click: () => {
          this.store.dispatch(changeTrack(ChangeTypes.NEXT));
        }
      },
      nextDisabled: {
        tooltip: 'Next',
        flags: ['disabled'],
        icon: nativeImage.createFromPath(path.join(iconsDirectory, 'next-disabled.png')),
        // tslint:disable-next-line:no-empty
        click: () => {}
      }
    };

    this.setThumbarButtons(this.store.getState());

    this.observables.statusChanged.subscribe(({ store }) => {
      this.setThumbarButtons(store);
    });

    this.observables.trackChanged.subscribe(({ store }) => {
      this.setThumbarButtons(store);
    });
  }

  public setThumbarButtons(store: StoreState) {
    const {
      player: { status, currentIndex }
    } = store;

    if (!(this.win && this.thumbarButtons)) return;

    const queue = getQueuePlaylistSelector(store);
    const queueLength = queue.items.length;

    switch (status) {
      case PlayerStatus.PLAYING:
        this.win.setThumbarButtons([
          queueLength > 0 || currentIndex > 0 ? this.thumbarButtons.prev : this.thumbarButtons.prevDisabled,
          this.thumbarButtons.pause,
          queueLength > 0 && currentIndex + 1 <= queueLength
            ? this.thumbarButtons.next
            : this.thumbarButtons.nextDisabled
        ]);
        break;
      case PlayerStatus.PAUSED:
        this.win.setThumbarButtons([
          queueLength > 0 || currentIndex > 0 ? this.thumbarButtons.prev : this.thumbarButtons.prevDisabled,
          this.thumbarButtons.play,
          queueLength > 0 && currentIndex + 1 <= queueLength
            ? this.thumbarButtons.next
            : this.thumbarButtons.nextDisabled
        ]);
        break;
      case PlayerStatus.STOPPED:
        this.win.setThumbarButtons([
          this.thumbarButtons.prevDisabled,
          this.thumbarButtons.playDisabled,
          this.thumbarButtons.nextDisabled
        ]);
        break;
      default:
    }
  }
}
