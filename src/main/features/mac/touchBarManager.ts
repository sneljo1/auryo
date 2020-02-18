import { EVENTS } from '@common/constants/events';
import { ChangeTypes, PlayerStatus } from '@common/store/player';
import { changeTrack, toggleStatus } from '@common/store/actions';
import * as SC from '@common/utils/soundcloudUtils';
import { autobind } from 'core-decorators';
// eslint-disable-next-line import/no-extraneous-dependencies
import { nativeImage, TouchBar } from 'electron';
import * as path from 'path';
import { WatchState } from '../feature';
import MacFeature from './macFeature';

const { TouchBarButton, TouchBarSpacer } = TouchBar;

const iconsDirectory = path.resolve(global.__static, 'icons');

@autobind
export default class TouchBarManager extends MacFeature {
  public readonly featureName = 'TouchBarManager';
  // tslint:disable-next-line: typedef
  public likestates = {
    liked: nativeImage.createFromPath(path.join(iconsDirectory, 'heart-full.png')).resize({
      width: 20
    }),
    unliked: nativeImage.createFromPath(path.join(iconsDirectory, 'heart.png')).resize({
      width: 20
    })
  };

  // tslint:disable-next-line: typedef
  public repoststates = {
    reposted: nativeImage.createFromPath(path.join(iconsDirectory, 'repost-enabled.png')).resize({
      width: 20
    }),
    notReposted: nativeImage.createFromPath(path.join(iconsDirectory, 'repost.png')).resize({
      width: 20
    })
  };

  // tslint:disable-next-line: typedef
  public playstates = {
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

  public prevBtn: Electron.TouchBarButton = new TouchBarButton({
    icon: nativeImage.createFromPath(path.join(iconsDirectory, 'previous.png')).resize({
      width: 20
    }),
    click: () => this.store.dispatch(changeTrack(ChangeTypes.PREV) as any)
  });

  public playPauseBtn: Electron.TouchBarButton = new TouchBarButton({
    icon: this.playstates.PAUSED,
    click: () => this.store.dispatch(toggleStatus() as any)
  });

  public nextBtn: Electron.TouchBarButton = new TouchBarButton({
    icon: nativeImage.createFromPath(path.join(iconsDirectory, 'next.png')).resize({
      width: 20
    }),
    click: () => this.store.dispatch(changeTrack(ChangeTypes.NEXT) as any)
  });

  public likeBtn: Electron.TouchBarButton = new TouchBarButton({
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

  public repostBtn: Electron.TouchBarButton = new TouchBarButton({
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

  public register() {
    const touchBar = new TouchBar({
      items: [
        this.prevBtn,
        this.playPauseBtn,
        this.nextBtn,
        new TouchBarSpacer({
          size: 'small'
        }),
        this.likeBtn,
        new TouchBarSpacer({
          size: 'small'
        }),
        this.repostBtn
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

  public checkIfLiked() {
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

        this.likeBtn.icon = liked ? this.likestates.liked : this.likestates.unliked;
      }
    } else {
      this.likeBtn.icon = this.likestates.unliked;
    }
  }

  public checkIfReposted() {
    const {
      entities: { trackEntities },
      player: { playingTrack },
      auth: { reposts }
    } = this.store.getState();

    if (playingTrack) {
      const trackId = playingTrack.id;
      const track = trackEntities[trackId];

      if (track) {
        const reposted = SC.hasID(track.id, reposts.track);

        this.repostBtn.icon = reposted ? this.repoststates.reposted : this.repoststates.notReposted;
      }
    } else {
      this.repostBtn.icon = this.repoststates.notReposted;
    }
  }

  public updateStatus({ currentValue }: WatchState<PlayerStatus>) {
    this.playPauseBtn.icon = this.playstates[currentValue];
  }
}
