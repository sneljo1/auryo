import { EVENTS } from '@common/constants/events';
import { IMAGE_SIZES } from '@common/constants/Soundcloud';
import { changeTrack, toggleStatus } from '@common/store/actions';
import { getTrackEntity } from '@common/store/entities/selectors';
import { ChangeTypes, PlayerStatus, PlayingTrack } from '@common/store/player';
import * as SC from '@common/utils/soundcloudUtils';
// eslint-disable-next-line import/no-extraneous-dependencies
import MediaService, { MetaData } from 'electron-media-service';
import { WatchState } from '../feature';
import MacFeature from './macFeature';

type milliseconds = number;

enum MediaStates {
  STOPPED = 'stopped',
  PLAYING = 'playing',
  PAUSED = 'paused'
}

export default class MediaServiceManager extends MacFeature {
  public readonly featureName = 'MediaServiceManager';
  private myService: MediaService | null = null;
  private readonly meta: MetaData = {
    state: MediaStates.STOPPED,
    title: '',
    id: -1,
    album: '',
    artist: '',
    duration: 0,
    currentTime: 0
  };

  public async register() {
    const { default: MediaServiceClass } = await import('electron-media-service');

    this.myService = new MediaServiceClass();

    this.myService.startService();
    this.myService.setMetaData(this.meta);

    this.myService.on('play', () => {
      const {
        player: { status }
      } = this.store.getState();

      if (status !== PlayerStatus.PLAYING) {
        this.store.dispatch(toggleStatus(PlayerStatus.PLAYING) as any);
      }
    });

    this.myService.on('pause', () => {
      const {
        player: { status }
      } = this.store.getState();

      if (status !== PlayerStatus.PAUSED) {
        this.store.dispatch(toggleStatus(PlayerStatus.PAUSED) as any);
      }
    });

    this.myService.on('stop', () => {
      this.store.dispatch(toggleStatus(PlayerStatus.STOPPED) as any);
    });

    this.myService.on('playPause', () => {
      this.store.dispatch(toggleStatus() as any);
    });

    this.myService.on('next', () => {
      this.store.dispatch(changeTrack(ChangeTypes.NEXT) as any);
    });

    this.myService.on('previous', () => {
      this.store.dispatch(changeTrack(ChangeTypes.PREV) as any);
    });

    this.myService.on('seek', (to: milliseconds) => {
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
          player: { playingTrack }
        } = currentState;

        if (playingTrack && this.myService) {
          const trackId = playingTrack.id;
          const track = getTrackEntity(trackId)(this.store.getState());

          if (track) {
            this.meta.id = track.id;
            this.meta.title = track.title;

            this.meta.artist = track.user && track.user.username ? track.user.username : 'Unknown artist';
            this.meta.albumArt = SC.getImageUrl(track, IMAGE_SIZES.LARGE);
            this.myService.setMetaData(this.meta);
          }
        }
      });

      /**
       * Update playback status
       */
      this.subscribe<PlayerStatus>(['player', 'status'], ({ currentValue: status }: any) => {
        this.meta.state = status.toLowerCase();

        if (this.myService) {
          this.myService.setMetaData(this.meta);
        }
      });

      /**
       * Update time
       */
      this.subscribe(['player', 'currentTime'], this.updateTime);
      this.subscribe(['player', 'duration'], this.updateTime);
    });
  }

  public updateTime = ({
    currentState: {
      player: { currentTime, duration }
    }
  }: WatchState<number>) => {
    this.meta.currentTime = Math.round(currentTime * 1e3);
    this.meta.duration = Math.round(duration * 1e3);

    if (this.myService) {
      this.myService.setMetaData(this.meta);
    }
  };

  public unregister() {
    super.unregister();

    if (this.myService && this.myService.isStarted()) {
      this.myService.stopService();
    }
  }
}
