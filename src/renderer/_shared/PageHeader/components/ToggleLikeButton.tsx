import * as actions from '@common/store/actions';
import { hasLiked } from '@common/store/auth/selectors';
import cn from 'classnames';
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  className?: string;

  playlistId?: string;
  trackId?: number;
  colored?: boolean;
}

export const ToggleLikeButton: FC<Props> = ({ className, playlistId, trackId, colored }) => {
  const playlistOrTrackId = (playlistId || trackId) as number | string;
  const liked = useSelector(hasLiked(playlistOrTrackId, playlistId ? 'playlist' : 'track'));
  const dispatch = useDispatch();

  return (
    <a
      href="javascript:void(0)"
      className={cn('c_btn', className, { active: liked, colored })}
      onClick={() => {
        dispatch(actions.toggleLike(playlistOrTrackId, !!playlistId));
      }}>
      <i className={`bx ${liked ? 'bxs-heart' : 'bx-heart'}`} />
      <span>{liked ? 'Liked' : 'Like'}</span>
    </a>
  );
};
