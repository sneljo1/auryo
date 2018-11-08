import * as notifier from 'node-notifier';
import { IMAGE_SIZES } from '../../common/constants';
import { EVENTS } from '../../common/constants/events';
import { getTrackEntity } from '../../common/store/entities/selectors';
import { SC } from '../../common/utils';
import Feature from './feature';
import * as is from 'electron-is';

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
          const image = SC.getImageUrl(track, IMAGE_SIZES.SMALL);
          let title = track.title;
          let message = `${track.user && track.user.username ? track.user.username : ''}`;

          // for some reason the thing that looks like a title, is less visible than the artist, so we switch it on linux
          if (is.linux()) {
            const m = message;
            message = title;
            title = m;
          }

          notifier.notify({
            title,
            message,
            icon: image,
          });

          // TODO add onclick to open the track
        }
      }
    });


  }

}
