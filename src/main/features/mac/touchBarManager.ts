import { changeTrack, toggleLike, toggleRepost, toggleStatus } from '@common/store/actions';
import { ChangeTypes } from '@common/store/player';
import { autobind } from 'core-decorators';
// eslint-disable-next-line import/no-extraneous-dependencies
import { nativeImage, TouchBar } from 'electron';
import * as path from 'path';
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
    click: () => this.store.dispatch(changeTrack(ChangeTypes.PREV))
  });

  public playPauseBtn: Electron.TouchBarButton = new TouchBarButton({
    icon: this.playstates.PAUSED,
    click: () => this.store.dispatch(toggleStatus())
  });

  public nextBtn: Electron.TouchBarButton = new TouchBarButton({
    icon: nativeImage.createFromPath(path.join(iconsDirectory, 'next.png')).resize({
      width: 20
    }),
    click: () => this.store.dispatch(changeTrack(ChangeTypes.NEXT))
  });

  public likeBtn: Electron.TouchBarButton = new TouchBarButton({
    icon: this.likestates.unliked,
    click: () => {
      this.store.dispatch(toggleLike.request({}));
    }
  });

  public repostBtn: Electron.TouchBarButton = new TouchBarButton({
    icon: this.repoststates.notReposted,
    click: () => {
      this.store.dispatch(toggleRepost.request({}));
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

    this.observables.statusChanged.subscribe(({ value: status }) => {
      this.playPauseBtn.icon = this.playstates[status];
    });

    this.observables.playingTrackLikeChanged.subscribe(({ value: liked }) => {
      this.likeBtn.icon = liked ? this.likestates.liked : this.likestates.unliked;
    });

    this.observables.playingTrackRepostChanged.subscribe(({ value: reposted }) => {
      this.repostBtn.icon = reposted ? this.repoststates.reposted : this.repoststates.notReposted;
    });
  }
}
