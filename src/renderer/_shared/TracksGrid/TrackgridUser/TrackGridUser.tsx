import { IMAGE_SIZES } from '@common/constants';
import * as actions from '@common/store/actions';
import { getUserEntity, isFollowing } from '@common/store/selectors';
import { abbreviateNumber, SC } from '@common/utils';
import cn from 'classnames';
import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import FallbackImage from '../../FallbackImage';
import './TrackGridUser.scss';

interface Props {
  userId: number;
  withStats?: boolean;
}

export const TrackGridUser: FC<Props> = ({ userId, withStats }) => {
  const dispatch = useDispatch();
  const trackUser = useSelector(getUserEntity(userId));
  const isAuthUserFollowing = useSelector(isFollowing(userId));

  if (!trackUser) return null;

  // eslint-disable-next-line, camelcase
  const { id, username, avatar_url, followers_count, track_count } = trackUser;

  const imgUrl = SC.getImageUrl(avatar_url, IMAGE_SIZES.SMALL);

  return (
    <div className="track-grid-user">
      <div className="track-grid-user-inner">
        <div className="track-grid-user-content">
          <div className="user-image">
            <FallbackImage src={imgUrl} width={90} height={90} />
          </div>
          <div className="user-info">
            <Link to={`/user/${id}`} className="user-title">
              {username}
            </Link>

            {withStats && (
              <div className="d-flex stats">
                <div className="d-flex align-items-center">
                  <i className="bx bx-user-group" />
                  <span>{abbreviateNumber(followers_count)}</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bx bx-album" />
                  <span>{abbreviateNumber(track_count)}</span>
                </div>
              </div>
            )}
            <a
              href="javascript:void(0)"
              className={cn('c_btn outline', { active: isAuthUserFollowing })}
              onClick={() => {
                dispatch(actions.toggleFollowing.request({ userId }));
              }}>
              {isAuthUserFollowing ? <i className="bx bx-check" /> : <i className="bx bx-plus" />}
              <span>{isAuthUserFollowing ? 'Following' : 'Follow'}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
