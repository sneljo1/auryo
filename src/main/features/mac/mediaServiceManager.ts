import { EVENTS } from '../../../shared/constants/events'
import { CHANGE_TYPES, PLAYER_STATUS } from '../../../shared/constants/player'
import { IMAGE_SIZES } from '../../../shared/constants/Soundcloud'
import * as SC from '../../../shared/utils/soundcloudUtils'
import MacFeature from './macFeature'
import { MediaService, MetaData, MediaStates, milliseconds } from './interfaces/electron-media-service.interfaces'

export default class MediaServiceManager extends MacFeature {
  private myService: MediaService
  private meta: MetaData = {
    state: MediaStates.STOPPED
  }

  register() {
    const MediaService = require('electron-media-service') // eslint-disable-line

    const myService = (this.myService = new MediaService())

    myService.startService()

    myService.setMetaData(this.meta)

    myService.on('play', () => {
      if (this.meta.state !== MediaStates.PLAYING) {
        this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.PLAYING)
      }
    })

    myService.on('pause', () => {
      if (this.meta.state === MediaStates.PLAYING) {
        this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.PAUSED)
      }
    })

    myService.on('stop', () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.STOPPED)
    })

    myService.on('playPause', () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS)
    })

    myService.on('next', () => {
      this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, CHANGE_TYPES.NEXT)
    })

    myService.on('previous', () => {
      this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, CHANGE_TYPES.PREV)
    })

    myService.on('seek', (to: milliseconds) => {
      this.sendToWebContents(EVENTS.PLAYER.SEEK, to)
    })

    //
    // WATCHERS
    //

    this.on(EVENTS.APP.READY, () => {
      /**
       * Update track information
       */

      this.subscribe(['player', 'playingTrack'], ({ currentState }: any) => {
        // TODO type enum later
        const {
          entities: { track_entities },
          player: { playingTrack }
        } = currentState

        const trackID = playingTrack.id
        const track = track_entities[trackID]

        if (track) {
          this.meta.id = track.id
          this.meta.title = track.title

          this.meta.artist = track.user && track.user.username ? track.user.username : 'Unknown artist'
          this.meta.albumArt = SC.getImageUrl(track, IMAGE_SIZES.LARGE)

          myService.setMetaData(this.meta)
        }
      })

      /**
       * Update playback status
       */
      this.subscribe(['player', 'status'], ({ currentValue: status }: any) => {
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

  updateTime = ({
    currentState: {
      player: { currentTime, duration }
    }
  }: any) => {
    // TODO type enum later

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
