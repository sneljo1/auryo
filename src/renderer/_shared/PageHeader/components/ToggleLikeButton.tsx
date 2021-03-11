import * as actions from '@common/store/actions';
import { hasLiked } from '@common/store/selectors';
import { LikeType } from '@common/store/types';
import cn from 'classnames';
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  className?: string;
  type: LikeType;
  id: string | number;
  colored?: boolean;
}

export const ToggleLikeButton: FC<Props> = ({ className, id, type, colored }) => {
  const liked = useSelector(hasLiked(id, type));
  const dispatch = useDispatch();

  return (
    <a
      href="javascript:void(0)"
      className={cn('c_btn', className, { active: liked, colored })}
      onClick={() => {
        dispatch(actions.toggleLike.request({ id, type }));
      }}>
      <i className={`bx ${liked ? 'bxs-heart' : 'bx-heart'}`} />
      <span>{liked ? 'Liked' : 'Like'}</span>
    </a>
  );
};
