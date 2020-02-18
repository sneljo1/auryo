import { StoreState } from '@common/store';
import { ChangeTypes, PlayerStatus } from '@common/store/player';
import { changeTrack, toggleStatus } from '@common/store/actions';
// eslint-disable-next-line import/no-extraneous-dependencies
import { nativeImage } from 'electron';
import * as is from 'electron-is';
import * as path from 'path';
import { Auryo } from '../../app';
import { Feature } from '../feature';
import { autobind } from 'core-decorators';

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
          this.togglePlay(PlayerStatus.PLAYING);
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
          this.togglePlay(PlayerStatus.PAUSED);
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
          this.changeTrack(ChangeTypes.PREV);
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
          this.changeTrack(ChangeTypes.NEXT);
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

    this.subscribe(['player', 'status'], ({ currentState }) => {
      this.setThumbarButtons(currentState);
    });

    this.subscribe(['player', 'playingTrack'], ({ currentState }) => {
      this.setThumbarButtons(currentState);
    });
  }

  public setThumbarButtons(state: StoreState) {
    const {
      player: { status, queue, currentIndex }
    } = state;

    if (this.win && this.thumbarButtons) {
      switch (status) {
        case PlayerStatus.PLAYING:
          this.win.setThumbarButtons([
            queue.length > 0 || currentIndex > 0 ? this.thumbarButtons.prev : this.thumbarButtons.prevDisabled,
            this.thumbarButtons.pause,
            queue.length > 0 && currentIndex + 1 <= queue.length
              ? this.thumbarButtons.next
              : this.thumbarButtons.nextDisabled
          ]);
          break;
        case PlayerStatus.PAUSED:
          this.win.setThumbarButtons([
            queue.length > 0 || currentIndex > 0 ? this.thumbarButtons.prev : this.thumbarButtons.prevDisabled,
            this.thumbarButtons.play,
            queue.length > 0 && currentIndex + 1 <= queue.length
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

  public togglePlay(newStatus: PlayerStatus) {
    const {
      player: { status }
    } = this.store.getState();

    if (status !== newStatus) {
      this.store.dispatch(toggleStatus(newStatus) as any);
    }
  }

  public changeTrack(changeType: ChangeTypes) {
    this.store.dispatch(changeTrack(changeType) as any);
  }
}
