import { nativeImage, TouchBar } from 'electron';
import * as path from 'path';
import { EVENTS } from '../../../common/constants/events';
import { ChangeTypes, PlayerStatus } from '../../../common/store/player';
import * as SC from '../../../common/utils/soundcloudUtils';
import { WatchState } from '../feature';
import MacFeature from './macFeature';

const { TouchBarButton, TouchBarSpacer } = TouchBar;

const iconsDirectory = process.env.NODE_ENV === 'development' ?
  path.resolve(__dirname, '..', '..', '..', 'assets', 'img', 'icons') :
  path.resolve(__dirname, './assets/img/icons');

export default class TouchBarManager extends MacFeature {
  likestates = {
    liked: nativeImage.createFromPath(path.join(iconsDirectory, 'heart-full.png')).resize({
      width: 20
    }),
    unliked: nativeImage.createFromPath(path.join(iconsDirectory, 'heart.png')).resize({
      width: 20
    })
  };

  repoststates = {
    reposted: nativeImage.createFromPath(path.join(iconsDirectory, 'repost-enabled.png')).resize({
      width: 20
    }),
    notReposted: nativeImage.createFromPath(path.join(iconsDirectory, 'repost.png')).resize({
      width: 20
    })
  };

  playstates = {
    PLAYING: nativeImage.createFromPath(path.join(iconsDirectory, 'pause.png')).resize({
      width: 20
    }),
    PAUSED: nativeImage.createFromPath(path.join(iconsDirectory, 'play.png')).resize({
      width: 20
    }),
    STOPPED: nativeImage.createFromPath(path.join(iconsDirectory, 'play.png')).resize({
      width: 20
    })
  };

  prev_btn = new TouchBarButton({
    icon: nativeImage.createFromPath(path.join(iconsDirectory, 'previous.png')).resize({
      width: 20
    }),
    click: () => this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, ChangeTypes.PREV)
  });

  playpause_btn = new TouchBarButton({
    icon: this.playstates.PAUSED,
    click: () => this.sendToWebContents(EVENTS.PLAYER.TOGGLE_STATUS)
  });

  next_btn = new TouchBarButton({
    icon: nativeImage.createFromPath(path.join(iconsDirectory, 'next.png')).resize({
      width: 20
    }),
    click: () => this.sendToWebContents(EVENTS.PLAYER.CHANGE_TRACK, ChangeTypes.NEXT)
  });

  like_btn = new TouchBarButton({
    icon: this.likestates.unliked,
    click: () => {
      const {
        player: { playingTrack }
      } = this.store.getState();

      if (playingTrack) {
        this.sendToWebContents(EVENTS.TRACK.LIKE, playingTrack.id);
      }
    }
  });

  repost_btn = new TouchBarButton({
    icon: this.repoststates.notReposted,
    click: () => {
      const {
        player: { playingTrack }
      } = this.store.getState();

      if (playingTrack) {
        this.sendToWebContents(EVENTS.TRACK.REPOST, playingTrack.id);
      }
    }
  });

  register() {
    const touchBar = new TouchBar({
      items: [
        this.prev_btn,
        this.playpause_btn,
        this.next_btn,
        new TouchBarSpacer({
          size: 'small'
        }),
        this.like_btn,
        new TouchBarSpacer({
          size: 'small'
        }),
        this.repost_btn
      ]
    });

    if (this.win) {
      this.win.setTouchBar(touchBar);
    }

    this.on(EVENTS.APP.READY, () => {
      this.subscribe(['player', 'status'], this.updateStatus);
      this.subscribe(['player', 'playingTrack'], this.checkIfLiked);

      this.on(EVENTS.TRACK.LIKED, this.checkIfLiked);
      this.on(EVENTS.TRACK.REPOSTED, this.checkIfReposted);
    });
  }

  checkIfLiked = () => {
    const {
      entities: { trackEntities },
      player: { playingTrack },
      auth: { likes }
    } = this.store.getState();

    if (playingTrack) {
      const trackId = playingTrack.id;
      const track = trackEntities[trackId];

      if (track) {
        const liked = SC.hasID(track.id, likes.track);

        this.like_btn.icon = liked ? this.likestates.liked : this.likestates.unliked;
      }
    } else {
      this.like_btn.icon = this.likestates.unliked;
    }
  }

  checkIfReposted = () => {
    const {
      entities: { trackEntities },
      player: { playingTrack },
      auth: { reposts }
    } = this.store.getState();

    if (playingTrack) {
      const trackId = playingTrack.id;
      const track = trackEntities[trackId];

      if (track) {
        const reposted = SC.hasID(track.id, reposts);

        this.repost_btn.icon = reposted ? this.repoststates.reposted : this.repoststates.notReposted;
      }
    } else {
      this.repost_btn.icon = this.repoststates.notReposted;
    }
  }

  updateStatus = ({ currentValue }: WatchState<PlayerStatus>) => {
    this.playpause_btn.icon = this.playstates[currentValue];
  }
}
