import { CHANGE_TYPES, PLAYER_STATUS } from '../../../shared/constants/player'
import * as SC from '../../../shared/utils/soundcloudUtils'
import { IMAGE_SIZES } from '../../../shared/constants/Soundcloud'
import { EVENTS } from '../../../shared/constants/events'
import IMacFeature from './IMacFeature'

export default class MediaServiceManager extends IMacFeature {

    meta = {}

    register() {
        const MediaService = require('electron-media-service') // eslint-disable-line

        const myService = this.myService = new MediaService()

        myService.startService()

        this.meta.state = 'stopped'

        myService.setMetaData(this.meta)

        myService.on('play', () => {
            if (this.meta.state !== 'playing') {
                this.router.send(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.PLAYING)
            }
        }
        )

        myService.on('pause', () => {
            if (this.meta.state === 'playing') {
                this.router.send(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.PAUSED)
            }
        })

        myService.on('stop', () => {
            this.router.send(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.STOPPED)
        })

        myService.on('playPause', () => {
            this.router.send(EVENTS.PLAYER.TOGGLE_STATUS)
        })

        myService.on('next', () => {
            this.router.send(EVENTS.PLAYER.CHANGE_TRACK, CHANGE_TYPES.NEXT)
        })

        myService.on('previous', () => {
            this.router.send(EVENTS.PLAYER.CHANGE_TRACK, CHANGE_TYPES.PREV)
        })

        myService.on('seek', (to) => {
            this.win.webContents.send('seek', to)
        })

        //
        // WATCHERS
        //

        this.on(EVENTS.APP.READY, () => {
            /**
             * Update track information
             */

            this.subscribe(['player', 'playingTrack'], ({ currentState }) => {
                const { entities: { track_entities }, player: { playingTrack } } = currentState

                const trackID = playingTrack.id
                const track = track_entities[trackID]

                if (track) {
                    this.meta.id = track.id
                    this.meta.title = track.title

                    this.meta.artist = (track.user && track.user.username) ? track.user.username : 'Unknown artist'
                    this.meta.albumArt = SC.getImageUrl(track, IMAGE_SIZES.LARGE)

                    myService.setMetaData(this.meta)
                }

            })


            /**
             * Update playback status
             */
            this.subscribe(['player', 'status'], ({ currentValue: status }) => {

                this.meta.state = status.toLowerCase()

                myService.setMetaData(this.meta)

            })

            /**
             * Update time
             */
            this.subscribe(['player', 'currentTime'], this.updateTime)
            this.subscribe(['player', 'duration'], this.updateTime)
        })
    }

    updateTime = ({ currentState: { player: { currentTime, duration } } }) => {

        this.meta.currentTime = currentTime
        this.meta.duration = duration

        this.myService.setMetaData(this.meta)
    }

    unregister() {
        super.unregister()

        if (this.myService && this.myService.isStarted()) {
            this.myService.stopService()
        }
    }

}