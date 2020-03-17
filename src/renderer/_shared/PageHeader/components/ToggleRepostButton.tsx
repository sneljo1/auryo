import * as actions from '@common/store/actions';
import { hasReposted } from '@common/store/auth/selectors';
import cn from 'classnames';
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  className?: string;

  playlistId?: string;
  trackId?: number;
  colored?: boolean;
}

export const ToggleRepostButton: FC<Props> = ({ className, playlistId, trackId, colored }) => {
  const playlistOrTrackId = (playlistId || trackId) as number | string;
  const reposted = useSelector(hasReposted(playlistOrTrackId, playlistId ? 'playlist' : 'track'));
  const dispatch = useDispatch();

  return (
    <a
      href="javascript:void(0)"
      className={cn('c_btn', className, { active: reposted, colored })}
      onClick={() => {
        dispatch(actions.toggleRepost(playlistOrTrackId, !!playlistId));
      }}>
      <i className="bx bx-repost" />
      <span>{reposted ? 'Reposted' : 'Repost'}</span>
    </a>
  );
};
