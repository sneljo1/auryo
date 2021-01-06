import * as actions from '@common/store/actions';
import { startPlayMusic } from '@common/store/actions';
import { PlayerStatus } from '@common/store/player';
import { getPlayerStatusSelector, isPlayingSelector } from '@common/store/selectors';
import { PlaylistIdentifier } from '@common/store/types';
import { Normalized } from '@types';
import cn from 'classnames';
import { stopForwarding } from 'electron-redux';
import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  className?: string;
  colored?: boolean;
  large?: boolean;
  idResult?: Normalized.NormalizedResult;
  playlistID: PlaylistIdentifier;
  onPlay?(): void;
}

export const TogglePlayButton: FC<Props> = ({ className, idResult, colored, large, playlistID }) => {
  const playerStatus = useSelector(getPlayerStatusSelector);
  const isPlaying = useSelector(isPlayingSelector(playlistID, idResult));
  const isPlayerPlaylist = false;

  const dispatch = useDispatch();

  const onStartPlay = useCallback(() => {
    dispatch(stopForwarding(startPlayMusic({ idResult, origin: playlistID })));
  }, [dispatch, idResult, playlistID]);

  const togglePlay = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      event.nativeEvent.stopImmediatePropagation();

      if (isPlayerPlaylist || isPlaying) {
        if (playerStatus !== PlayerStatus.PLAYING) {
          dispatch(actions.toggleStatus(PlayerStatus.PLAYING));
        } else if (playerStatus === PlayerStatus.PLAYING) {
          dispatch(actions.toggleStatus(PlayerStatus.PAUSED));
        }
      } else {
        onStartPlay();
      }
    },
    [dispatch, isPlayerPlaylist, isPlaying, onStartPlay, playerStatus]
  );

  const getIcon = useCallback(() => {
    let icon = 'play';

    if ((isPlayerPlaylist || isPlaying) && playerStatus === PlayerStatus.PLAYING) {
      icon = 'pause';
    }

    return icon;
  }, [isPlayerPlaylist, isPlaying, playerStatus]);

  return (
    <a href="javascript:void(0)" className={cn('c_btn round', className, { colored, large })} onClick={togglePlay}>
      <i className={`bx bx-${getIcon()}`} />
    </a>
  );
};

export default TogglePlayButton;
