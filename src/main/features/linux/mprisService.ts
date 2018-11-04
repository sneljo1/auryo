import * as _ from 'lodash';
import * as path from 'path';
import { EVENTS } from '../../../common/constants/events';
import { IMAGE_SIZES } from '../../../common/constants/Soundcloud';
import { ChangeTypes, PlayerStatus } from '../../../common/store/player';
import * as SC from '../../../common/utils/soundcloudUtils';
import { Logger } from '../../utils/logger';
import { WatchState } from '../feature';
import { MprisServiceClient } from './interfaces/mpris-service.interface';
import LinuxFeature from './linuxFeature';
import { getTrackEntity } from '../../../common/store/entities/selectors';

const logosPath = process.env.NODE_ENV === 'development' ?
  path.resolve(__dirname, '..', '..', '..', 'assets', 'img', 'logos') :
  path.resolve(__dirname, './assets/img/logos');

export default class MprisService extends LinuxFeature {
  private logger: Logger = new Logger('MprisService');

  private meta: MprisServiceClient.MetaData = {};
  private player: MprisServiceClient.Player | null = null;

  shouldRun() {
    return super.shouldRun() && !process.env.TOKEN;
  }

  register() {
    let mpris;

    try {
      mpris = require('mpris-service');

      this.player = mpris({
        name: 'auryo-player',
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
        this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PlayerStatus.PLAYING);
      });

      this.player.on('pause', () => {
        this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PlayerStatus.PAUSED);
      });

      this.player.on('playpause', () => {
        this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS);
      });

      this.player.on('stop', () => {
        this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PlayerStatus.STOPPED);
      });

      this.player.on('next', () => {
        this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, ChangeTypes.NEXT);
      });

      this.player.on('previous', () => {
        this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, ChangeTypes.PREV);
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

            const position = queue.indexOf(playingTrack);

            this.player.canGoPrevious = queue.length > 0 && position > 0;
            this.player.canGoNext = queue.length > 0 && position + 1 <= queue.length;

            this.meta = {
              ...this.meta,
              ...this.player.metadata
            };

            if (track) {
              this.meta['mpris:trackId'] = this.player.objectPath(track.id.toString());
              this.meta['mpris:length'] = track.duration || 0;
              this.meta['mpris:artUrl'] = SC.getImageUrl(track, IMAGE_SIZES.SMALL);
              this.meta['xesam:genre'] = [track.genre || ''];
              this.meta['xesam:title'] = track.title;
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
      this.logger.warn('Mpris not supported', e);
      return;
    }

  }

  updateStatus({ currentValue }: WatchState<PlayerStatus>) {
    if (currentValue && this.player) {
      this.player.playbackStatus =
        currentValue
          .toLowerCase()
          .charAt(0)
          .toUpperCase() + currentValue.toLowerCase().slice(1) as any;
    }
  }

  updateTime = ({
    currentState: {
      player: { currentTime, duration }
    }
  }: WatchState<number>) => {

    if (this.player) {
      this.meta = {
        ...this.meta,
        ...this.player.metadata
      };

      this.meta['mpris:length'] = duration * 1e3;
      this.player.position = currentTime * 1e3;

      if (!_.isEqual(this.meta, this.player.metadata)) {
        this.player.metadata = this.meta;
      }
    }
  }
}
