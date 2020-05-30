import * as actions from '@common/store/actions';
import { hasReposted } from '@common/store/selectors';
import cn from 'classnames';
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RepostType } from '@common/store/types';

interface Props {
  className?: string;
  id: string | number;
  type: RepostType;
  colored?: boolean;
}

export const ToggleRepostButton: FC<Props> = ({ className, id, type, colored }) => {
  const reposted = useSelector(hasReposted(id, type));
  const dispatch = useDispatch();

  return (
    <a
      href="javascript:void(0)"
      className={cn('c_btn', className, { active: reposted, colored })}
      onClick={() => {
        dispatch(actions.toggleRepost.request({ id, type }));
      }}>
      <i className="bx bx-repost" />
      <span>{reposted ? 'Reposted' : 'Repost'}</span>
    </a>
  );
};
