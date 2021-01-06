import { EVENTS } from '@common/constants/events';
import { IMAGE_SIZES } from '@common/constants/Soundcloud';
import { changeTrack, toggleStatus } from '@common/store/actions';
import { ChangeTypes, PlayerStatus } from '@common/store/player';
import * as SC from '@common/utils/soundcloudUtils';
// eslint-disable-next-line import/no-extraneous-dependencies
import MediaService, { MetaData } from 'electron-media-service';
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
      this.store.dispatch(toggleStatus(PlayerStatus.PLAYING));
    });

    this.myService.on('pause', () => {
      this.store.dispatch(toggleStatus(PlayerStatus.PAUSED));
    });

    this.myService.on('stop', () => {
      this.store.dispatch(toggleStatus(PlayerStatus.STOPPED));
    });

    this.myService.on('playPause', () => {
      this.store.dispatch(toggleStatus());
    });

    this.myService.on('next', () => {
      this.store.dispatch(changeTrack(ChangeTypes.NEXT));
    });

    this.myService.on('previous', () => {
      this.store.dispatch(changeTrack(ChangeTypes.PREV));
    });

    this.myService.on('seek', (to: milliseconds) => {
      this.sendToWebContents(EVENTS.PLAYER.SEEK, to / 1000);
    });

    /**
     * Update track information
     */
    this.observables.trackChanged.subscribe(({ value: track }) => {
      if (this.myService) {
        this.meta.id = track.id;
        this.meta.title = track.title;

        this.meta.artist = track.user && track.user.username ? track.user.username : 'Unknown artist';
        this.meta.albumArt = SC.getImageUrl(track, IMAGE_SIZES.LARGE);
        this.myService.setMetaData(this.meta);
      }
    });

    /**
     * Sync status
     */
    this.observables.statusChanged.subscribe(({ value: status }) => {
      this.meta.state = MediaStates[status];

      if (this.myService) {
        this.myService.setMetaData(this.meta);
      }
    });

    /**
     * Sync currentTime
     */
    this.observables.playerCurrentTimeChanged.subscribe(({ value: currentTime }) => {
      this.meta.currentTime = Math.round(currentTime * 1e3);

      if (this.myService) {
        this.myService.setMetaData(this.meta);
      }
    });

    /**
     * Sync duration
     */
    this.observables.playerDurationChanged.subscribe(({ value: duration }) => {
      this.meta.duration = Math.round(duration * 1e3);

      if (this.myService) {
        this.myService.setMetaData(this.meta);
      }
    });
  }

  public unregister() {
    super.unregister();

    if (this.myService && this.myService.isStarted()) {
      this.myService.stopService();
    }
  }
}
