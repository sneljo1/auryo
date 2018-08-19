/* eslint-disable global-require */
import IWindowsFeature from '../IWindowsFeature'
import { EVENTS } from '../../../../shared/constants/events'
import { PLAYER_STATUS } from '../../../../shared/constants'
import { CHANGE_TYPES } from '../../../../shared/constants/player'
import * as SC from '../../../../shared/utils/soundcloudUtils'
import { IMAGE_SIZES } from '../../../../shared/constants/Soundcloud'

export default class Win10MediaService extends IWindowsFeature {

    // eslint-disable-next-line
    shouldRun() {
        return false; // TODO remove this and figure out why nodert isn't being added on AppVeyor
    }

    register() {
        const { MediaPlaybackStatus, MediaPlaybackType, SystemMediaTransportControlsButton } = require('@nodert-win10/windows.media')
        const { BackgroundMediaPlayer } = require('@nodert-win10/windows.media.playback')
        const { RandomAccessStreamReference } = require('@nodert-win10/windows.storage.streams')
        const { Uri } = require('@nodert-win10/windows.foundation')

        const Controls = BackgroundMediaPlayer.current.systemMediaTransportControls

        Controls.isChannelDownEnabled = false
        Controls.isChannelUpEnabled = false
        Controls.isFastForwardEnabled = false
        Controls.isNextEnabled = true
        Controls.isPauseEnabled = true
        Controls.isPlayEnabled = true
        Controls.isPreviousEnabled = true
        Controls.isRecordEnabled = false
        Controls.isRewindEnabled = false
        Controls.isStopEnabled = true
        Controls.playbackStatus = MediaPlaybackStatus.closed
        Controls.displayUpdater.type = MediaPlaybackType.music

        Controls.displayUpdater.musicProperties.title = 'Auryo'
        Controls.displayUpdater.musicProperties.artist = 'No track is playing'
        Controls.displayUpdater.update()

        Controls.on('buttonpressed', (sender, eventArgs) => {
            switch (eventArgs.button) {
                case SystemMediaTransportControlsButton.play:
                    this.togglePlay(PLAYER_STATUS.PLAYING)
                    break
                case SystemMediaTransportControlsButton.pause:
                    this.togglePlay(PLAYER_STATUS.PAUSED)
                    break
                case SystemMediaTransportControlsButton.stop:
                    this.togglePlay(PLAYER_STATUS.STOPPED)
                    break
                case SystemMediaTransportControlsButton.next:
                    this.changeTrack(CHANGE_TYPES.NEXT)
                    break
                case SystemMediaTransportControlsButton.previous:
                    this.changeTrack(CHANGE_TYPES.PREV)
                    break
                default:
                    break
            }
        })



        this.on(EVENTS.APP.READY, () => {
            this.on(EVENTS.PLAYER.STATUS_CHANGED, () => {
                const { player: { status } } = this.store.getState()

                const mapping = {
                    [PLAYER_STATUS.STOPPED]: MediaPlaybackStatus.stopped,
                    [PLAYER_STATUS.PAUSED]: MediaPlaybackStatus.paused,
                    [PLAYER_STATUS.PLAYING]: MediaPlaybackStatus.playing
                }

                Controls.playbackStatus = mapping[status]

            })

            this.on(EVENTS.PLAYER.TRACK_CHANGED, () => {
                const { entities: { track_entities, user_entities }, player: { playingTrack } } = this.store.getState()

                const trackID = playingTrack.id
                const track = track_entities[trackID]
                const user = user_entities[track.user || track.user_id]

                Controls.displayUpdater.musicProperties.title = track.title
                Controls.displayUpdater.musicProperties.artist = (user && user.username ? user.username : 'Unknown artist')
                Controls.displayUpdater.musicProperties.albumTitle = track.genre
                Controls.displayUpdater.thumbnail = RandomAccessStreamReference.createFromUri(new Uri(SC.getImageUrl(track, IMAGE_SIZES.SMALL)))

                Controls.displayUpdater.update()
            })
        })
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