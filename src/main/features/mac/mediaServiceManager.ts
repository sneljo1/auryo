import { EVENTS } from '../../../common/constants/events';
import { IMAGE_SIZES } from '../../../common/constants/Soundcloud';
import { ChangeTypes, PlayerStatus, PlayingTrack } from '../../../common/store/player';
import * as SC from '../../../common/utils/soundcloudUtils';
import { MediaService, MediaStates, MetaData, milliseconds } from './interfaces/electron-media-service.interfaces';
import MacFeature from './macFeature';
import { WatchState } from '../feature';

export default class MediaServiceManager extends MacFeature {
  private myService: MediaService | null = null;
  private meta: MetaData = {
    state: MediaStates.STOPPED
  };

  register() {
    const MediaService = require('electron-media-service');

    const myService = (this.myService = new MediaService());

    myService.startService();

    myService.setMetaData(this.meta);

    myService.on('play', () => {
      if (this.meta.state !== MediaStates.PLAYING) {
        this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PlayerStatus.PLAYING);
      }
    });

    myService.on('pause', () => {
      if (this.meta.state === MediaStates.PLAYING) {
        this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PlayerStatus.PAUSED);
      }
    });

    myService.on('stop', () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PlayerStatus.STOPPED);
    });

    myService.on('playPause', () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS);
    });

    myService.on('next', () => {
      this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, ChangeTypes.NEXT);
    });

    myService.on('previous', () => {
      this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, ChangeTypes.PREV);
    });

    myService.on('seek', (to: milliseconds) => {
      this.sendToWebContents(EVENTS.PLAYER.SEEK, to / 1000);
    });

    //
    // WATCHERS
    //

    /**
     * Update track information
     */
    this.on(EVENTS.APP.READY, () => {
      this.subscribe<PlayingTrack>(['player', 'playingTrack'], ({ currentState }) => {
        const {
          entities: { trackEntities, userEntities },
          player: { playingTrack }
        } = currentState;

        if (playingTrack) {
          const trackId = playingTrack.id;
          const track = trackEntities[trackId];

          if (track) {
            const user = userEntities[track.user || track.user_id];

            this.meta.id = track.id;
            this.meta.title = track.title;

            this.meta.artist = user && user.username ? user.username : 'Unknown artist';
            this.meta.albumArt = SC.getImageUrl(track, IMAGE_SIZES.LARGE);

            myService.setMetaData(this.meta);
          }
        }
      });

      /**
       * Update playback status
       */
      this.subscribe<PlayerStatus>(['player', 'status'], ({ currentValue: status }: any) => {
        this.meta.state = status.toLowerCase();

        myService.setMetaData(this.meta);
      });

      /**
       * Update time
       */
      this.subscribe(['player', 'currentTime'], this.updateTime);
      this.subscribe(['player', 'duration'], this.updateTime);
    });
  }

  updateTime = ({
    currentState: {
      player: { currentTime, duration }
    }
  }: WatchState<number>) => {

    this.meta.currentTime = currentTime * 1000;
    this.meta.duration = duration * 1000;

    if (this.myService){
      this.myService.setMetaData(this.meta);
    }
  }

  unregister() {
    super.unregister();

    if (this.myService && this.myService.isStarted()) {
      this.myService.stopService();
    }
  }
}
