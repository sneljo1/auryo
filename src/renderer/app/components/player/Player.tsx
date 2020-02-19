import { Intent, Popover, PopoverInteractionKind, Slider, Tag } from '@blueprintjs/core';
import { IMAGE_SIZES } from '@common/constants';
import { StoreState } from '@common/store';
import * as actions from '@common/store/actions';
import { hasLiked } from '@common/store/auth/selectors';
import { getNormalizedTrack, getNormalizedUser } from '@common/store/entities/selectors';
import { ChangeTypes, RepeatTypes } from '@common/store/player';
import { SC } from '@common/utils';
import cn from 'classnames';
import { autobind } from 'core-decorators';
import moment from 'moment';
import React from 'react';
import isDeepEqual from 'react-fast-compare';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import FallbackImage from '../../../_shared/FallbackImage';
import Queue from '../Queue/Queue';
import { Audio } from './components/Audio';
import PlayerControls from './components/PlayerControls/PlayerControls';
import { PlayerProgress } from './components/PlayerProgress/PlayerProgress';
import { TrackInfo } from './components/TrackInfo/TrackInfo';
import * as styles from './Player.module.scss';

const mapStateToProps = (state: StoreState) => {
  const { player, app, config } = state;

  let track = null;
  let trackUser = null;
  let liked = false;

  if (player.playingTrack && player.playingTrack.id) {
    track = getNormalizedTrack(player.playingTrack.id)(state);

    if (track) {
      trackUser = getNormalizedUser(track.user)(state);
    }

    liked = hasLiked(player.playingTrack.id)(state);

    if (!track || (track && !track.title && track.loading)) {
      track = null;
    }
  }

  return {
    track,
    trackUser,
    status: player.status,
    playingTrack: player.playingTrack,
    volume: config.audio.volume,
    muted: config.audio.muted,
    shuffle: config.shuffle,
    repeat: config.repeat,
    playbackDeviceId: config.audio.playbackDeviceId,
    overrideClientId: config.app.overrideClientId,
    remainingPlays: app.remainingPlays,
    liked,
    chromecast: app.chromecast
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      changeTrack: actions.changeTrack,
      toggleStatus: actions.toggleStatus,
      setConfigKey: actions.setConfigKey,
      setCurrentTime: actions.setCurrentTime,
      addToast: actions.addToast,
      toggleShuffle: actions.toggleShuffle,
      toggleLike: actions.toggleLike,
      useChromeCast: actions.useChromeCast
    },
    dispatch
  );

type PropsFromState = ReturnType<typeof mapStateToProps>;
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

interface State {
  isVolumeSeeking: boolean;
  volume: number;
  volumeBeforeMute: number;
}

type AllProps = PropsFromState & PropsFromDispatch;

@autobind
class Player extends React.Component<AllProps, State> {
  public state: State = {
    isVolumeSeeking: false,
    volume: 0,
    volumeBeforeMute: 0.5
  };

  public shouldComponentUpdate(nextProps: AllProps, nextState: State) {
    return nextState !== this.state || !isDeepEqual(nextProps, this.props);
  }

  public volumeChange(volume: number) {
    const { muted, setConfigKey } = this.props;

    if (muted) {
      setConfigKey('audio.muted', false);
    }
    this.setState({
      volume,
      isVolumeSeeking: true
    });
  }

  public toggleRepeat() {
    const { setConfigKey, repeat } = this.props;

    let newRepeatType: RepeatTypes | null = null;

    if (!repeat) {
      newRepeatType = RepeatTypes.ALL;
    } else if (repeat === RepeatTypes.ALL) {
      newRepeatType = RepeatTypes.ONE;
    }

    setConfigKey('repeat', newRepeatType);
  }

  public toggleMute() {
    const { muted, setConfigKey, volume } = this.props;
    const { volumeBeforeMute } = this.state;

    if (muted) {
      this.volumeChange(volumeBeforeMute);
    } else {
      this.setState({
        volumeBeforeMute: volume
      });
      this.volumeChange(0);
    }

    setConfigKey('audio.muted', !muted);
  }

  public changeSong(changeType: ChangeTypes) {
    const { changeTrack } = this.props;

    changeTrack(changeType);
  }

  public toggleShuffle() {
    const { shuffle, toggleShuffle } = this.props;

    toggleShuffle(!shuffle);
  }

  public renderAudio() {
    const {
      playingTrack,
      status,
      volume: configVolume,
      track,
      remainingPlays,
      // overrideClientId,
      chromecast,
      muted,
      playbackDeviceId
    } = this.props;
    const { isVolumeSeeking, volume } = this.state;

    if (!track || !playingTrack) {
      return null;
    }

    const audioVolume = isVolumeSeeking ? volume : configVolume;

    const limitReached = remainingPlays && remainingPlays.remaining === 0;

    if (remainingPlays && limitReached) {
      return (
        <div className={styles.rateLimit}>
          Stream limit reached! Unfortunately the API enforces a 15K plays/day limit. This limit will expire in{' '}
          <Tag className="ml-2" intent={Intent.PRIMARY}>
            {moment(remainingPlays.resetTime).fromNow()}
          </Tag>
        </div>
      );
    }

    const playingOnChromecast = !!chromecast.castApp;

    return (
      <Audio
        // ref={this.audio}
        src={`http://localhost:8888/stream/${track.id}`}
        playerStatus={status}
        // autoPlay={autoplay}
        playerVolume={audioVolume}
        muted={muted || playingOnChromecast}
        playbackDeviceId={playbackDeviceId}
      />
    );
  }

  public render() {
    const {
      playingTrack,
      status,
      volume: configVolume,
      repeat,
      liked,
      shuffle,
      toggleStatus,
      track,
      toggleLike,
      chromecast,
      useChromeCast,
      muted,
      trackUser,
      setConfigKey
    } = this.props;

    const { isVolumeSeeking, volume } = this.state;

    if (!track || !playingTrack || !trackUser) {
      return null;
    }

    if (!track.title || !track.user) {
      return <div>Loading</div>;
    }

    const overlayImage = SC.getImageUrl(track, IMAGE_SIZES.XSMALL);

    const audioVolume = isVolumeSeeking ? volume : configVolume;

    let volumeIcon = 'volume-full';

    if (muted || audioVolume === 0) {
      volumeIcon = 'volume-mute';
    } else if (audioVolume !== 1) {
      volumeIcon = 'volume-low';
    }

    return (
      <div className={styles.player}>
        <div className={styles.player_bg}>
          <FallbackImage noPlaceholder src={overlayImage} />
        </div>

        {this.renderAudio()}

        <div className="d-flex align-items-center">
          <TrackInfo
            title={track.title}
            id={track.id.toString()}
            userId={trackUser.id.toString()}
            username={trackUser.username}
            img={overlayImage}
            liked={liked}
            toggleLike={() => {
              toggleLike(track.id);
            }}
          />

          <PlayerControls
            status={status}
            repeat={repeat}
            shuffle={shuffle}
            onRepeatClick={this.toggleRepeat}
            onShuffleClick={this.toggleShuffle}
            onPreviousClick={() => {
              this.changeSong(ChangeTypes.PREV);
            }}
            onNextClick={() => {
              this.changeSong(ChangeTypes.NEXT);
            }}
            onToggleClick={() => {
              toggleStatus();
            }}
          />

          <PlayerProgress />

          <Popover
            className="mr-2"
            popoverClassName={styles.playerPopover}
            interactionKind={PopoverInteractionKind.HOVER}
            hoverOpenDelay={50}
            content={
              <div className={styles.playerVolume}>
                <Slider
                  min={0}
                  max={1}
                  value={audioVolume}
                  stepSize={0.1}
                  vertical
                  onChange={this.volumeChange}
                  labelRenderer={false}
                  onRelease={value => {
                    this.setState({
                      isVolumeSeeking: false
                    });

                    setConfigKey('audio.volume', value);
                  }}
                />
              </div>
            }>
            <a className={styles.control} href="javascript:void(0)" onClick={this.toggleMute}>
              <i className={`bx bx-${volumeIcon}`} />
            </a>
          </Popover>

          {!!chromecast.devices.length && (
            <Popover
              className="mr-2"
              popoverClassName={styles.playerPopover}
              content={
                <div style={{ minWidth: 200 }}>
                  <div className={styles.popoverTitle}>Nearby devices</div>
                  {chromecast.devices.map(d => {
                    return (
                      <div
                        role="button"
                        key={d.id}
                        className={styles.castDevice}
                        onClick={() => {
                          useChromeCast(chromecast.selectedDeviceId === d.id ? undefined : d.id);
                        }}>
                        {chromecast.selectedDeviceId === d.id && <i className="bx bx-stop" />}
                        <div>
                          {d.name}
                          <div className={styles.castSub}>
                            {chromecast.selectedDeviceId === d.id && !chromecast.castApp && 'Connecting...'}
                            {chromecast.selectedDeviceId === d.id && chromecast.castApp ? 'Casting' : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              }>
              <a
                className={cn(styles.control, {
                  [styles.active]: !!chromecast.castApp
                })}
                href="javascript:void(0)">
                <i className="bx bx-cast" />
              </a>
            </Popover>
          )}

          <Popover popoverClassName={styles.playerPopover} content={<Queue />} position="bottom-right">
            <a className={styles.control} href="javascript:void(0)">
              <i className="bx bxs-playlist" />
            </a>
          </Popover>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player);
