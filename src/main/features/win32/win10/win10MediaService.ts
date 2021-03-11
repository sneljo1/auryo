import { IMAGE_SIZES } from '@common/constants/Soundcloud';
import { changeTrack, toggleStatus } from '@common/store/actions';
import { ChangeTypes, PlayerStatus } from '@common/store/player';
import * as SC from '@common/utils/soundcloudUtils';
import { Logger, LoggerInstance } from '../../../utils/logger';
import { WindowsFeature } from '../windowsFeature';

import {
  MediaPlaybackStatus,
  MediaPlaybackType,
  SystemMediaTransportControlsButton
  // eslint-disable-next-line import/no-extraneous-dependencies
} from '@nodert-win10-rs4/windows.media';

// eslint-disable-next-line
import { BackgroundMediaPlayer } from '@nodert-win10-rs4/windows.media.playback';
// eslint-disable-next-line
import { RandomAccessStreamReference } from '@nodert-win10-rs4/windows.storage.streams';
// eslint-disable-next-line
import { Uri } from '@nodert-win10-rs4/windows.foundation';

export default class Win10MediaService extends WindowsFeature {
  public readonly featureName = 'Win10MediaService';
  private readonly logger: LoggerInstance = Logger.createLogger(this.featureName);

  public shouldRun() {
    return super.shouldRun() && !process.env.TOKEN; // TODO remove this and figure out why nodert isn't being added on AppVeyor
  }

  public register() {
    try {
      const Controls = BackgroundMediaPlayer.current.systemMediaTransportControls;

      Controls.isChannelDownEnabled = false;
      Controls.isChannelUpEnabled = false;
      Controls.isFastForwardEnabled = false;
      Controls.isNextEnabled = true;
      Controls.isPauseEnabled = true;
      Controls.isPlayEnabled = true;
      Controls.isPreviousEnabled = true;
      Controls.isRecordEnabled = false;
      Controls.isRewindEnabled = false;
      Controls.isStopEnabled = true;
      Controls.playbackStatus = MediaPlaybackStatus.closed;
      Controls.displayUpdater.type = MediaPlaybackType.music;

      Controls.displayUpdater.musicProperties.title = 'Auryo';
      Controls.displayUpdater.musicProperties.artist = 'No track is playing';
      Controls.displayUpdater.update();

      Controls.on('buttonpressed', (_sender: any, eventArgs: any) => {
        switch (eventArgs.button) {
          case SystemMediaTransportControlsButton.play:
            this.store.dispatch(toggleStatus(PlayerStatus.PLAYING));
            break;
          case SystemMediaTransportControlsButton.pause:
            this.store.dispatch(toggleStatus(PlayerStatus.PAUSED));
            break;
          case SystemMediaTransportControlsButton.stop:
            this.store.dispatch(toggleStatus(PlayerStatus.STOPPED));
            break;
          case SystemMediaTransportControlsButton.next:
            this.store.dispatch(changeTrack(ChangeTypes.NEXT));
            break;
          case SystemMediaTransportControlsButton.previous:
            this.store.dispatch(changeTrack(ChangeTypes.PREV));
            break;
          default:
        }
      });

      this.observables.statusChanged.subscribe(({ value: status }) => {
        const mapping = {
          [PlayerStatus.STOPPED]: MediaPlaybackStatus.stopped,
          [PlayerStatus.PAUSED]: MediaPlaybackStatus.paused,
          [PlayerStatus.PLAYING]: MediaPlaybackStatus.playing
        };

        Controls.playbackStatus = mapping[status];
      });

      // Track changed
      this.observables.trackChanged.subscribe(({ value: track }) => {
        if (track) {
          const image = SC.getImageUrl(track, IMAGE_SIZES.SMALL);
          Controls.displayUpdater.musicProperties.title = track.title || '';
          Controls.displayUpdater.musicProperties.artist =
            track.user && track.user.username ? track.user.username : 'Unknown artist';
          Controls.displayUpdater.musicProperties.albumTitle = track.genre || '';
          Controls.displayUpdater.thumbnail = image ? RandomAccessStreamReference.createFromUri(new Uri(image)) : '';
        } else {
          Controls.displayUpdater.musicProperties.title = 'Auryo';
          Controls.displayUpdater.musicProperties.artist = 'No track is playing';
        }

        Controls.displayUpdater.update();
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}
