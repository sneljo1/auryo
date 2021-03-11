import { Intent, Popover, PopoverInteractionKind, Slider, Tag } from '@blueprintjs/core';
import { IMAGE_SIZES } from '@common/constants';
import * as actions from '@common/store/actions';
import { isPlayingOnChromecastSelector, remainingPlaysSelector } from '@common/store/app/selectors';
import { ChangeTypes, RepeatTypes } from '@common/store/player';
import {
  audioConfigSelector,
  getNormalizedTrack,
  getNormalizedUser,
  getPlayerStatusSelector,
  getPlayingTrackSelector,
  isTrackLoading,
  repeatSelector,
  shuffleSelector
} from '@common/store/selectors';
import { SC } from '@common/utils';
import moment from 'moment';
import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FallbackImage from '../../../_shared/FallbackImage';
import { Queue } from '../Queue/Queue';
import { CastPopover } from './components/CastPopover';
import PlayerControls from './components/PlayerControls/PlayerControls';
import { PlayerProgress } from './components/PlayerProgress/PlayerProgress';
import { TrackInfo } from './components/TrackInfo/TrackInfo';
import styles from './Player.module.scss';

export const Player: FC = () => {
  const dispatch = useDispatch();
  const playingTrack = useSelector(getPlayingTrackSelector);
  const playerStatus = useSelector(getPlayerStatusSelector);
  const track = useSelector(getNormalizedTrack(playingTrack?.id));
  const user = useSelector(getNormalizedUser(track?.user));
  const trackLoading = useSelector(isTrackLoading(playingTrack?.id));
  const audioConfig = useSelector(audioConfigSelector);
  const shuffle = useSelector(shuffleSelector);
  const repeat = useSelector(repeatSelector);
  const remainingPlays = useSelector(remainingPlaysSelector);

  const changeVolume = useCallback(
    (value: number) => {
      dispatch(actions.setConfigKey('audio.volume', value));
    },
    [dispatch]
  );

  const volumeChange = useCallback(
    (value: number) => {
      if (audioConfig.muted) {
        dispatch(actions.setConfigKey('audio.muted', false));
      }

      changeVolume(value);
    },
    [audioConfig.muted, changeVolume, dispatch]
  );

  const toggleShuffle = useCallback(() => {
    dispatch(actions.toggleShuffle(!shuffle));
  }, [dispatch, shuffle]);

  const toggleRepeat = useCallback(() => {
    let newRepeatType: RepeatTypes | null = null;

    if (!repeat) {
      newRepeatType = RepeatTypes.ALL;
    } else if (repeat === RepeatTypes.ALL) {
      newRepeatType = RepeatTypes.ONE;
    }

    dispatch(actions.setConfigKey('repeat', newRepeatType));
  }, [dispatch, repeat]);

  const toggleMute = useCallback(() => {
    if (audioConfig.muted) {
      dispatch(actions.setConfigKey('audio.muted', false));
    }
    dispatch(actions.setConfigKey('audio.muted', !audioConfig.muted));
  }, [audioConfig.muted, dispatch]);

  const renderAudio = useCallback(() => {
    if (!track || !playingTrack) {
      return null;
    }

    const limitReached = remainingPlays && remainingPlays.remaining === 0;

    if (remainingPlays && limitReached) {
      return (
        <div className={styles.rateLimit}>
          Stream limit reached! Unfortunately the SoundCloud API enforces a 15K plays/day limit. This limit will expire
          in{' '}
          <Tag className="ml-2" intent={Intent.PRIMARY}>
            {moment(remainingPlays.resetTime).fromNow()}
          </Tag>
        </div>
      );
    }

    return null;
  }, [playingTrack, remainingPlays, track]);

  if (!track || trackLoading || !user) {
    return null;
  }

  if (!track.title || !track.user) {
    return <div>Loading</div>;
  }

  const overlayImage = SC.getImageUrl(track, IMAGE_SIZES.XSMALL);

  const audioVolume = audioConfig.muted ? 0 : audioConfig.volume;

  let volumeIcon = 'volume-full';

  if (audioConfig.muted || audioVolume === 0) {
    volumeIcon = 'volume-mute';
  } else if (audioVolume !== 1) {
    volumeIcon = 'volume-low';
  }

  return (
    <div className={styles.player}>
      <div className={styles.player_bg}>
        <FallbackImage noPlaceholder src={overlayImage} />
      </div>

      {renderAudio()}

      <div className="d-flex align-items-center">
        <TrackInfo title={track.title} id={track.id.toString()} user={user} img={overlayImage} />

        <PlayerControls
          status={playerStatus}
          repeat={repeat}
          shuffle={shuffle}
          onRepeatClick={toggleRepeat}
          onShuffleClick={toggleShuffle}
          onPreviousClick={() => {
            dispatch(actions.changeTrack(ChangeTypes.PREV));
          }}
          onNextClick={() => {
            dispatch(actions.changeTrack(ChangeTypes.NEXT));
          }}
          onToggleClick={() => {
            dispatch(actions.toggleStatus());
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
                onChange={volumeChange}
                labelRenderer={false}
              />
            </div>
          }>
          <a className={styles.control} href="javascript:void(0)" onClick={toggleMute}>
            <i className={`bx bx-${volumeIcon}`} />
          </a>
        </Popover>

        <CastPopover />

        <Popover popoverClassName={styles.playerPopover} content={<Queue />} position="bottom-right">
          <a className={styles.control} href="javascript:void(0)">
            <i className="bx bxs-playlist" />
          </a>
        </Popover>
      </div>
    </div>
  );
};
