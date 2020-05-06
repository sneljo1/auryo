import { IMAGE_SIZES } from '@common/constants';
import { EVENTS } from '@common/constants/events';
import { getTrackEntity } from '@common/store/entities/selectors';
import { PlayingTrack } from '@common/store/player';
import { SC } from '@common/utils';
import { Auryo } from '@main/app';
import { Feature } from '../feature';
import { settings } from '../../settings';
import fs from 'fs';

export default class NotificationManager extends Feature {
  public readonly featureName = 'NotificationManager';
  constructor(auryo: Auryo) {
    super(auryo, 'ready-to-show');
  }

  public register() {
    // Track changed
    this.subscribe<PlayingTrack>(['player', 'playingTrack'], ({ currentState }) => {
      const {
        player: { playingTrack },
        config: {
          app: { showTrackChangeNotification }
        }
      } = currentState;

      if (playingTrack) {
        const trackId = playingTrack.id;
        const track = getTrackEntity(trackId)(currentState);

        if (settings.get('app.logTrackChange')) {
          fs.writeFileSync('/tmp/auryo_status.log', `${track?.title}\n${track?.user?.username}`);
        }

        const isFocused = !this.win || (this.win && this.win.isFocused());

        if (track && showTrackChangeNotification && !isFocused) {
          this.sendToWebContents(EVENTS.APP.SEND_NOTIFICATION, {
            title: track.title,
            message: `${track.user && track.user.username ? track.user.username : ''}`,
            image: SC.getImageUrl(track, IMAGE_SIZES.SMALL)
          });
        }
      }
    });
  }
}
