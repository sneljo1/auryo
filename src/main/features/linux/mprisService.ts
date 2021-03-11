import { IMAGE_SIZES } from '@common/constants/Soundcloud';
import { changeTrack, toggleStatus } from '@common/store/actions';
import { ChangeTypes, PlayerStatus } from '@common/store/player';
import { getQueuePlaylistSelector } from '@common/store/selectors';
import * as SC from '@common/utils/soundcloudUtils';
import { _StoreState } from 'AppReduxTypes';
import { autobind } from 'core-decorators';
import * as _ from 'lodash';
import * as path from 'path';
import { Logger, LoggerInstance } from '../../utils/logger';
import { MprisServiceClient } from './interfaces/mpris-service.interface';
import LinuxFeature from './linuxFeature';

const logosPath = path.resolve(global.__static, 'logos');

@autobind
export default class MprisService extends LinuxFeature {
  public readonly featureName = 'MprisService';
  private readonly logger: LoggerInstance = Logger.createLogger(MprisService.featureName);

  private meta: MprisServiceClient.MetaData = {};
  private player: MprisServiceClient.Player | null = null;

  public shouldRun() {
    return super.shouldRun() && !process.env.TOKEN;
  }

  public register() {
    let mpris;

    try {
      // eslint-disable-next-line
      mpris = require('mpris-service');

      this.player = mpris({
        name: 'auryo_player',
        identity: 'Auryo',
        canRaise: true,
        supportedInterfaces: ['player'],
        desktopEntry: 'Auryo'
      }) as MprisServiceClient.Player;

      this.player.playbackStatus = 'Stopped';
      this.player.canEditTracks = false;
      this.player.canSeek = false;
      this.player.canGoPrevious = false;
      this.player.canGoNext = false;
      this.player.shuffle = false;
      this.player.canControl = true;
      this.player.loopStatus = 'None';
      this.player.rate = 1.0;

      this.player.metadata = {
        'xesam:title': 'Auryo',
        'mpris:artUrl': `file://${path.join(logosPath, 'auryo-128.png')}`
      };

      this.player.on('raise', () => {
        if (this.win) {
          this.win.setSkipTaskbar(false);
          this.win.show();
        }
      });

      this.player.on('quit', () => {
        if (this.win) {
          this.win.close();
        }
      });

      this.player.on('play', () => {
        this.store.dispatch(toggleStatus(PlayerStatus.PLAYING));
      });

      this.player.on('pause', () => {
        this.store.dispatch(toggleStatus(PlayerStatus.PAUSED));
      });

      this.player.on('playpause', () => {
        this.store.dispatch(toggleStatus());
      });

      this.player.on('stop', () => {
        this.store.dispatch(toggleStatus(PlayerStatus.STOPPED));
      });

      this.player.on('next', () => {
        this.store.dispatch(changeTrack(ChangeTypes.NEXT));
      });

      this.player.on('previous', () => {
        this.store.dispatch(changeTrack(ChangeTypes.PREV));
      });

      //
      // WATCHERS
      //

      // Update track information
      this.observables.trackChanged.subscribe(({ value: track, store }) => {
        const {
          player: { playingTrack, currentIndex }
        } = store;

        if (track && this.player && playingTrack) {
          const queue = getQueuePlaylistSelector(store);
          const queueLength = queue.items.length;

          this.player.canGoPrevious = queueLength > 0 && currentIndex > 0;
          this.player.canGoNext = queueLength > 0 && currentIndex + 1 <= queueLength;

          this.meta = {
            ...this.meta,
            ...this.player.metadata
          };

          if (track) {
            this.meta['mpris:trackId'] = this.player.objectPath(track.id.toString());
            this.meta['mpris:length'] = this.parseTime(track.duration); // int
            this.meta['mpris:artUrl'] = SC.getImageUrl(track, IMAGE_SIZES.XLARGE);
            this.meta['xesam:genre'] = [track.genre || ''];
            this.meta['xesam:title'] = track.title || '';
            this.meta['xesam:artist'] = [track.user && track.user.username ? track.user.username : 'Unknown artist'];
            this.meta['xesam:url'] = track.uri || '';
            this.meta['xesam:useCount'] = track.playback_count || 0;
          } else {
            this.meta['xesam:title'] = 'Auryo';
            this.meta['xesam:artist'] = [''];
            this.meta['mpris:length'] = 0;
            this.meta['xesam:url'] = '';
            this.meta['mpris:artUrl'] = `file://${path.join(logosPath, 'auryo-128.png')}`;
          }

          if (!_.isEqual(this.meta, this.player.metadata)) {
            this.player.metadata = this.meta;
          }
        }
      });

      this.observables.statusChanged.subscribe(({ value: status }) => {
        if (status && this.player) {
          this.player.playbackStatus = (status.toLowerCase().charAt(0).toUpperCase() +
            status.toLowerCase().slice(1)) as any;
        }
      });

      this.observables.playerDurationChanged.subscribe(({ store }) => this.updateTime(store));
      this.observables.playerCurrentTimeChanged.subscribe(({ store }) => this.updateTime(store));
    } catch (e) {
      this.logger.warn('Mpris not supported');
      this.logger.warn(e);
    }
  }

  public updateTime = ({ player: { currentTime, duration } }: _StoreState) => {
    if (this.player) {
      this.meta = {
        ...this.meta,
        ...this.player.metadata
      };

      this.meta['mpris:length'] = this.parseTime(duration);
      this.player.position = this.parseTime(currentTime);

      if (!_.isEqual(this.meta, this.player.metadata)) {
        this.player.metadata = this.meta;
      }
    }
  };

  private parseTime(time: number) {
    if (!time || Number.isNaN(time) || time < 0) {
      return 0;
    }

    return Math.round(time * 1e3);
  }
}
