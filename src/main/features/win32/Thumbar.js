import { nativeImage } from 'electron';
import path from 'path';
import { EVENTS } from '../../../shared/constants/events';
import { CHANGE_TYPES, PLAYER_STATUS } from '../../../shared/constants/index';
import IWindowsFeature from './IWindowsFeature';

let iconsDirectory

if (process.env.NODE_ENV === 'development') {
    iconsDirectory = path.resolve(__dirname, '..', '..', '..', 'assets', 'img', 'icons')
} else {
    iconsDirectory = path.resolve(__dirname, './assets/img/icons')
}

export default class Thumbar extends IWindowsFeature {

    constructor(app) {
        super(app)

        this.waitUntil = 'focus'
    }

    register() {

        this.thumbarButtons = {
            play: {
                tooltip: 'Play',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'play.png')),
                click: () => {
                    this.togglePlay(PLAYER_STATUS.PLAYING)
                }
            },
            playDisabled: {
                tooltip: 'Play',
                flags: ['disabled'],
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'play-disabled.png'))
            },
            pause: {
                tooltip: 'Pause',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'pause.png')),
                click: () => {
                    this.togglePlay(PLAYER_STATUS.PAUSED)
                }
            },
            pauseDisabled: {
                tooltip: 'Pause',
                flags: ['disabled'],
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'pause-disabled.png'))
            },
            prev: {
                tooltip: 'Prev',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'previous.png')),
                click: () => {
                    this.changeTrack(CHANGE_TYPES.PREV)
                }
            },
            prevDisabled: {
                tooltip: 'Prev',
                flags: ['disabled'],
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'previous-disabled.png'))
            },
            next: {
                tooltip: 'Next',
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'next.png')),
                click: () => {
                    this.changeTrack(CHANGE_TYPES.NEXT)
                }
            },
            nextDisabled: {
                tooltip: 'Next',
                flags: ['disabled'],
                icon: nativeImage.createFromPath(path.join(iconsDirectory, 'next-disabled.png'))
            }
        }

        this.setThumbarButtons()

        this.on(EVENTS.APP.READY, () => {
            this.subscribe(['player', 'status'], () => {
                this.setThumbarButtons()

            })

            this.subscribe(['player', 'playingTrack'], () => {
                this.setThumbarButtons()
            })
        })
    }

    setThumbarButtons = () => {
        const { player: { status, queue, currentIndex } } = this.store.getState()

        switch (status) {
            case PLAYER_STATUS.PLAYING:
                this.win.setThumbarButtons([
                    (queue.length > 0 || currentIndex > 0) ? this.thumbarButtons.prev : this.thumbarButtons.prevDisabled,
                    this.thumbarButtons.pause,
                    (queue.length > 0 && (currentIndex + 1 <= queue.length)) ? this.thumbarButtons.next : this.thumbarButtons.nextDisabled
                ])
                break
            case PLAYER_STATUS.PAUSED:
                this.win.setThumbarButtons([
                    (queue.length > 0 || currentIndex > 0) ? this.thumbarButtons.prev : this.thumbarButtons.prevDisabled,
                    this.thumbarButtons.play,
                    (queue.length > 0 && (currentIndex + 1 <= queue.length)) ? this.thumbarButtons.next : this.thumbarButtons.nextDisabled
                ])
                break
            case PLAYER_STATUS.STOPPED:
                this.win.setThumbarButtons([
                    this.thumbarButtons.prevDisabled,
                    this.thumbarButtons.playDisabled,
                    this.thumbarButtons.nextDisabled
                ])
                break;
            default:
                break;
        }
    }

    togglePlay = (new_status) => {
        const { player: { status } } = this.store.getState()

        if (status !== new_status) {
            this.router.send(EVENTS.PLAYER.TOGGLE_STATUS, new_status)
        }
    }

    changeTrack = (change_type) => {
        this.router.send(EVENTS.PLAYER.CHANGE_TRACK, change_type)
    }
}