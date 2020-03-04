import { EVENTS } from '@common/constants/events';
import { IMAGE_SIZES } from '@common/constants/Soundcloud';
import { getTrackEntity } from '@common/store/entities/selectors';
import { ChangeTypes, PlayerStatus } from '@common/store/player';
import { changeTrack, toggleStatus } from '@common/store/actions';
import { getCurrentPosition } from '@common/utils';
import * as SC from '@common/utils/soundcloudUtils';
import * as _ from 'lodash';
import * as path from 'path';
import { Logger, LoggerInstance } from '../../utils/logger';
import { WatchState } from '../feature';
import { MprisServiceClient } from './interfaces/mpris-service.interface';
import LinuxFeature from './linuxFeature';

const logosPath = path.resolve(global.__static, 'logos');

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
        this.store.dispatch(toggleStatus(PlayerStatus.PLAYING) as any);
      });

      this.player.on('pause', () => {
        this.store.dispatch(toggleStatus(PlayerStatus.PAUSED) as any);
      });

      this.player.on('playpause', () => {
        this.store.dispatch(toggleStatus() as any);
      });

      this.player.on('stop', () => {
        this.store.dispatch(toggleStatus(PlayerStatus.STOPPED) as any);
      });

      this.player.on('next', () => {
        this.store.dispatch(changeTrack(ChangeTypes.NEXT) as any);
      });

      this.player.on('previous', () => {
        this.store.dispatch(changeTrack(ChangeTypes.PREV) as any);
      });

      //
      // WATCHERS
      //

      this.on(EVENTS.APP.READY, () => {
        /**
         * Update track information
         */
        this.subscribe(['player', 'playingTrack'], ({ currentState }) => {
          const {
            player: { playingTrack, queue }
          } = currentState;

          if (playingTrack && this.player) {
            const trackId = playingTrack.id;
            const track = getTrackEntity(trackId)(currentState);

            const position = getCurrentPosition({ queue, playingTrack });

            this.player.canGoPrevious = queue.length > 0 && position > 0;
            this.player.canGoNext = queue.length > 0 && position + 1 <= queue.length;

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

        /**
         * Update time
         */
        this.subscribe(['player', 'status'], this.updateStatus.bind(this));
        this.subscribe(['player', 'currentTime'], this.updateTime.bind(this));
        this.subscribe(['player', 'duration'], this.updateTime.bind(this));
      });
    } catch (e) {
      this.logger.warn('Mpris not supported');
      this.logger.warn(e);
    }
  }

  public updateStatus({ currentValue }: WatchState<PlayerStatus>) {
    if (currentValue && this.player) {
      this.player.playbackStatus = (currentValue
        .toLowerCase()
        .charAt(0)
        .toUpperCase() + currentValue.toLowerCase().slice(1)) as any;
    }
  }

  public updateTime = ({
    currentState: {
      player: { currentTime, duration }
    }
  }: WatchState<number>) => {
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
