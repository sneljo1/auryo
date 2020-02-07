import { EVENTS } from '@common/constants/events';
import { IMAGE_SIZES } from '@common/constants/Soundcloud';
import { changeTrack, toggleStatus } from '@common/store/actions';
import { getTrackEntity } from '@common/store/entities/selectors';
import { ChangeTypes, PlayerStatus, PlayingTrack } from '@common/store/player';
import * as SC from '@common/utils/soundcloudUtils';
import { Logger, LoggerInstance } from '../../../utils/logger';
import { WindowsFeature } from '../windowsFeature';

export default class Win10MediaService extends WindowsFeature {
  public readonly featureName = 'Win10MediaService';
  private readonly logger: LoggerInstance = Logger.createLogger(this.featureName);

  public shouldRun() {
    return super.shouldRun() && !process.env.TOKEN; // TODO remove this and figure out why nodert isn't being added on AppVeyor
  }

  public register() {
    try {
      const {
        MediaPlaybackStatus,
        MediaPlaybackType,
        SystemMediaTransportControlsButton
        // eslint-disable-next-line
      } = require('@nodert-win10/windows.media');
      // eslint-disable-next-line
      const { BackgroundMediaPlayer } = require('@nodert-win10/windows.media.playback');
      // eslint-disable-next-line
      const { RandomAccessStreamReference } = require('@nodert-win10/windows.storage.streams');
      // eslint-disable-next-line
      const { Uri } = require('@nodert-win10/windows.foundation');

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
            this.togglePlay(PlayerStatus.PLAYING);
            break;
          case SystemMediaTransportControlsButton.pause:
            this.togglePlay(PlayerStatus.PAUSED);
            break;
          case SystemMediaTransportControlsButton.stop:
            this.togglePlay(PlayerStatus.STOPPED);
            break;
          case SystemMediaTransportControlsButton.next:
            this.changeTrack(ChangeTypes.NEXT);
            break;
          case SystemMediaTransportControlsButton.previous:
            this.changeTrack(ChangeTypes.PREV);
            break;
          default:
        }
      });

      this.on(EVENTS.APP.READY, () => {
        // Status changed
        this.subscribe<PlayerStatus>(['player', 'status'], ({ currentValue: status }: any) => {
          const mapping = {
            [PlayerStatus.STOPPED]: MediaPlaybackStatus.stopped,
            [PlayerStatus.PAUSED]: MediaPlaybackStatus.paused,
            [PlayerStatus.PLAYING]: MediaPlaybackStatus.playing
          };

          Controls.playbackStatus = mapping[status];
        });

        // Track changed
        this.subscribe<PlayingTrack>(['player', 'playingTrack'], ({ currentState }) => {
          const {
            player: { playingTrack }
          } = currentState;

          if (playingTrack) {
            const trackId = playingTrack.id;
            const track = getTrackEntity(trackId)(this.store.getState());

            if (track) {
              const image = SC.getImageUrl(track, IMAGE_SIZES.SMALL);
              Controls.displayUpdater.musicProperties.title = track.title || '';
              Controls.displayUpdater.musicProperties.artist =
                track.user && track.user.username ? track.user.username : 'Unknown artist';
              Controls.displayUpdater.musicProperties.albumTitle = track.genre || '';
              Controls.displayUpdater.thumbnail = image
                ? RandomAccessStreamReference.createFromUri(new Uri(image))
                : '';

              Controls.displayUpdater.update();

              return;
            }
          }

          Controls.displayUpdater.musicProperties.title = 'Auryo';
          Controls.displayUpdater.musicProperties.artist = 'No track is playing';

          Controls.displayUpdater.update();
        });
      });
    } catch (e) {
      this.logger.error(e);
    }
  }

  public togglePlay = (newStatus: PlayerStatus) => {
    const {
      player: { status }
    } = this.store.getState();

    if (status !== newStatus) {
      this.store.dispatch(toggleStatus(newStatus) as any);
    }
  };

  public changeTrack = (changeType: ChangeTypes) => {
    this.store.dispatch(changeTrack(changeType) as any);
  };
}
