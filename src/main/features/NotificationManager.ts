import { IMAGE_SIZES } from '../../common/constants';
import { EVENTS } from '../../common/constants/events';
import { getTrackEntity } from '../../common/store/entities/selectors';
import { SC } from '../../common/utils';
import Feature from './feature';

export default class NotificationManager extends Feature {

  register() {

    this.on(EVENTS.PLAYER.TRACK_CHANGED, () => {

      if (!this.win || (this.win && this.win.isFocused())) {
        return;
      }

      const state = this.store.getState();

      const {
        player: { playingTrack },
        config: { app: { showTrackChangeNotification } }
      } = state;

      if (playingTrack && showTrackChangeNotification) {
        const trackId = playingTrack.id;
        const track = getTrackEntity(trackId)(state);

        if (track) {

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
