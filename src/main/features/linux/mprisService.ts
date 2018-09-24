import _ from 'lodash';
import * as path from 'path';
import { EVENTS } from '../../../shared/constants/events';
import { CHANGE_TYPES, PLAYER_STATUS } from '../../../shared/constants/player';
import { IMAGE_SIZES } from '../../../shared/constants/Soundcloud';
import * as SC from '../../../shared/utils/soundcloudUtils';
import { Logger } from '../../utils/logger';
import { MprisServiceClient } from './interfaces/mpris-service.interface';
import LinuxFeature from './linuxFeature';

let logosPath: string;

if (process.env.NODE_ENV === 'development') {
  logosPath = path.resolve(__dirname, '..', '..', '..', 'assets', 'img', 'logos');
} else {
  logosPath = path.resolve(__dirname, './assets/img/logos');
}

export default class MprisService extends LinuxFeature {
  private logger: Logger = new Logger('MprisService');

  private meta: MprisServiceClient.MetaData = {};
  private player: MprisServiceClient.Player;

  shouldRun() {
    return super.shouldRun() && !process.env.TOKEN;
  }

  register() {
    let mpris;

    try {
      mpris = require('mpris-service'); // eslint-disable-line

      this.player = mpris({
        name: 'auryo-player',
        identity: 'Auryo',
        canRaise: true,
        supportedInterfaces: ['player'],
        desktopEntry: 'Auryo'
      });
    } catch (e) {
      this.logger.warn('Mpris not supported', e);
      return;
    }

    this.player.playbackStatus = 'Stopped';
    this.player.canEditTracks = false;
    this.player.canSeek = false;
    // this.player.canGoPrevious = false;
    // this.player.canGoNext = false;
    this.player.shuffle = false;
    this.player.canControl = true;
    this.player.loopStatus = 'None';
    this.player.rate = 1.0;

    this.player.metadata = {
      'xesam:title': 'Auryo',
      'mpris:artUrl': `file://${path.join(logosPath, 'auryo-128.png')}`
    };

    this.player.on('raise', () => {
      this.win.setSkipTaskbar(false);
      this.win.show();
    });

    this.player.on('quit', () => {
      this.win.close();
    });

    this.player.on('play', () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.PLAYING);
    });

    this.player.on('pause', () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.PAUSED);
    });

    this.player.on('playpause', () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS);
    });

    this.player.on('stop', () => {
      this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS, PLAYER_STATUS.STOPPED);
    });

    this.player.on('next', () => {
      this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, CHANGE_TYPES.NEXT);
    });

    this.player.on('previous', () => {
      this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, CHANGE_TYPES.PREV);
    });

    //
    // WATCHERS
    //

    this.on(EVENTS.APP.READY, () => {
      /**
       * Update track information
       */
      this.subscribe(['player', 'playingTrack'], ({ currentState }: any) => {
        // TODO type later
        const {
          entities: { track_entities, user_entities },
          player: { playingTrack, queue }
        } = currentState;

        const trackID = playingTrack.id;
        const track = track_entities[trackID];
        const position = queue.indexOf(playingTrack);
        const user = user_entities[track.user || track.user_id];

        this.player.canGoPrevious = queue.length > 0 && position > 0;
        this.player.canGoNext = queue.length > 0 && position + 1 <= queue.length;

        this.meta = {
          ...this.meta,
          ...this.player.metadata
        };

        if (track) {
          this.meta['mpris:trackid'] = this.player.objectPath(track.id);
          this.meta['mpris:length'] = track.duration * 1000;
          this.meta['mpris:artUrl'] = SC.getImageUrl(track, IMAGE_SIZES.SMALL);

          this.meta['xesam:title'] = track.title;
          this.meta['xesam:artist'] = [user && user.username ? user.username : 'Unknown artist'];
          this.meta['xesam:url'] = track.uri || '';
          this.meta['xesam:useCount'] = track.playback_count || 0;
        } else {
          this.meta['xesam:title'] = 'Auryo';
          this.meta['xesam:artist'] = [''];
          this.meta['xesam:url'] = '';
          this.meta['mpris:artUrl'] = `file://${path.join(logosPath, 'auryo-128.png')}`;
        }

        if (!_.isEqual(this.meta, this.player.metadata)) {
          this.player.metadata = this.meta;
        }
      });

      /**
       * Update time
       */
      this.subscribe(['player', 'status'], this.updateStatus);
      this.subscribe(['player', 'currentTime'], this.updateTime);
      this.subscribe(['player', 'duration'], this.updateTime);
    });
  }

  updateStatus = ({ currentValue }: any) => {
    // TODO type later
    if (currentValue) {
      this.player.playbackStatus =
        currentValue
          .toLowerCase()
          .charAt(0)
          .toUpperCase() + currentValue.toLowerCase().slice(1);
    }
  }

  updateTime = ({
    currentState: {
      player: { currentTime, duration }
    }
  }: any) => {
    // TODO type later

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
