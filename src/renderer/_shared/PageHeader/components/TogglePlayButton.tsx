import * as actions from '@common/store/actions';
import { PlayerStatus } from '@common/store/player';
import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import cn from 'classnames';

interface Props {
  className?: string;
  colored?: boolean;

  playlistId?: string;
  trackId?: number;
  onPlay(): void;
}

export const TogglePlayButton: FC<Props> = ({ className, playlistId, trackId, onPlay, colored }) => {
  const playerStatus = useSelector(state => state.player.status);
  const isPlayerPlaylist = useSelector(state => !!playlistId && state.player.currentPlaylistId === playlistId);
  const isTrackPlaying = useSelector(state => !!trackId && state.player.playingTrack?.id === trackId);

  const dispatch = useDispatch();

  const togglePlay = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      event.nativeEvent.stopImmediatePropagation();

      if (isPlayerPlaylist || isTrackPlaying) {
        if (playerStatus !== PlayerStatus.PLAYING) {
          dispatch(actions.toggleStatus(PlayerStatus.PLAYING));
        } else if (playerStatus === PlayerStatus.PLAYING) {
          dispatch(actions.toggleStatus(PlayerStatus.PAUSED));
        }
      } else {
        onPlay();
      }
    },
    [dispatch, isPlayerPlaylist, isTrackPlaying, onPlay, playerStatus]
  );

  const getIcon = useCallback(() => {
    let icon = 'play';

    if ((isPlayerPlaylist || isTrackPlaying) && playerStatus === PlayerStatus.PLAYING) {
      icon = 'pause';
    }

    return icon;
  }, [isPlayerPlaylist, isTrackPlaying, playerStatus]);

  return (
    <a href="javascript:void(0)" className={cn('c_btn round', className, { colored })} onClick={togglePlay}>
      <i className={`bx bx-${getIcon()}`} />
    </a>
  );
};

export default TogglePlayButton;
