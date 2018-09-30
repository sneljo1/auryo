import { EVENTS } from '../../../shared/constants/events';
import { IMAGE_SIZES } from '../../../shared/constants/Soundcloud';
import { ChangeTypes, PlayerStatus, PlayingTrack } from '../../../shared/store/player';
import * as SC from '../../../shared/utils/soundcloudUtils';
import { MediaService, MediaStates, MetaData, milliseconds } from './interfaces/electron-media-service.interfaces';
import MacFeature from './macFeature';
import { WatchState } from '../feature';

export default class MediaServiceManager extends MacFeature {
  private myService: MediaService;
  private meta: MetaData = {
    state: MediaStates.STOPPED
  };

  register() {
    const MediaService = require('electron-media-service'); // eslint-disable-line

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
      this.sendToWebContents(EVENTS.PLAYER.SEEK, to);
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
          const trackID = playingTrack.id;
          const track = trackEntities[trackID];
          const user = userEntities[track.user || track.user_id];

          if (track) {
            this.meta.id = parseInt(track.id);
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

    this.meta.currentTime = currentTime;
    this.meta.duration = duration;

    this.myService.setMetaData(this.meta);
  }

  unregister() {
    super.unregister();

    if (this.myService && this.myService.isStarted()) {
      this.myService.stopService();
    }
  }
}
