import { nativeImage } from 'electron';
import * as is from 'electron-is';
import * as path from 'path';
import { CHANGE_TYPES, PLAYER_STATUS } from '../../../shared/constants';
import { EVENTS } from '../../../shared/constants/events';
import IFeature from '../feature';
import { Auryo } from '../../app';

let iconsDirectory: string;

if (process.env.NODE_ENV === 'development') {
  iconsDirectory = path.resolve(__dirname, '..', '..', '..', 'assets', 'img', 'icons');
} else {
  iconsDirectory = path.resolve(__dirname, './assets/img/icons');
}

type ThumbarPreset = {
  play: Electron.ThumbarButton
  playDisabled: Electron.ThumbarButton
  pause: Electron.ThumbarButton
  pauseDisabled: Electron.ThumbarButton
  prev: Electron.ThumbarButton
  prevDisabled: Electron.ThumbarButton
  next: Electron.ThumbarButton
  nextDisabled: Electron.ThumbarButton
};

export default class Thumbar extends IFeature {
  private thumbarButtons: ThumbarPreset;

  constructor(auryo: Auryo) {
    super(auryo, 'waitUntill');
  }

  shouldRun() {
    return is.windows();
  }

  register() {
    this.thumbarButtons = {
      play: {
        tooltip: 'Play',
        icon: nativeImage.createFromPath(path.join(iconsDirectory, 'play.png')),
        click: () => {
          this.togglePlay(PLAYER_STATUS.PLAYING);
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
          this.togglePlay(PLAYER_STATUS.PAUSED);
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
          this.changeTrack(CHANGE_TYPES.PREV);
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
          this.changeTrack(CHANGE_TYPES.NEXT);
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

    this.setThumbarButtons();

    this.on(EVENTS.APP.READY, () => {
      this.subscribe(['player', 'status'], () => {
        this.setThumbarButtons();
      });

      this.subscribe(['player', 'playingTrack'], () => {
        this.setThumbarButtons();
      });
    });
  }

  setThumbarButtons = () => {
    const {
      player: { status, queue, currentIndex }
    } = this.store.getState();

    switch (status) {
      case PLAYER_STATUS.PLAYING:
        this.win.setThumbarButtons([
          queue.length > 0 || currentIndex > 0 ? this.thumbarButtons.prev : this.thumbarButtons.prevDisabled,
          this.thumbarButtons.pause,
          queue.length > 0 && currentIndex + 1 <= queue.length ? this.thumbarButtons.next : this.thumbarButtons.nextDisabled
        ]);
        break;
      case PLAYER_STATUS.PAUSED:
        this.win.setThumbarButtons([
          queue.length > 0 || currentIndex > 0 ? this.thumbarButtons.prev : this.thumbarButtons.prevDisabled,
          this.thumbarButtons.play,
          queue.length > 0 && currentIndex + 1 <= queue.length ? this.thumbarButtons.next : this.thumbarButtons.nextDisabled
        ]);
        break;
      case PLAYER_STATUS.STOPPED:
        this.win.setThumbarButtons([this.thumbarButtons.prevDisabled, this.thumbarButtons.playDisabled, this.thumbarButtons.nextDisabled]);
        break;
      default:
        break;
    }
  }

  togglePlay = (newStatus: any) => {
    // TODO change when enum
    const {
      player: { status }
    } = this.store.getState();

    if (status !== newStatus) {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, newStatus);
    }
  }

  changeTrack = (changeType: any) => {
    // TODO change when enum
    this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, changeType);
  }
}
