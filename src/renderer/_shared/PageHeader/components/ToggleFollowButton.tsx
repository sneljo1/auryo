import * as actions from '@common/store/actions';
import { isFollowing } from '@common/store/selectors';
import cn from 'classnames';
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  className?: string;
  userId: string;
  colored?: boolean;
}

export const ToggleFollowButton: FC<Props> = ({ className, userId, colored }) => {
  const isFollowingArtist = useSelector(isFollowing(userId));
  const dispatch = useDispatch();

  return (
    <a
      href="javascript:void(0)"
      className={cn('c_btn', className, { active: isFollowingArtist, colored })}
      onClick={() => {
        dispatch(actions.toggleFollowing.request({ userId }));
      }}>
      <i
        className={cn('bx', {
          'bx-check': isFollowingArtist,
          'bx-plus': !isFollowingArtist
        })}
      />
      <span>{isFollowingArtist ? 'Following' : 'Follow'}</span>
    </a>
  );
};
