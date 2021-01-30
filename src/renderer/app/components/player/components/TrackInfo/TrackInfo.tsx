import * as actions from '@common/store/actions';
import { hasLiked } from '@common/store/selectors';
import { SoundCloud } from '@types';
import cn from 'classnames';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import FallbackImage from '../../../../../_shared/FallbackImage';
import { TextShortener } from '../../../../../_shared/TextShortener';
import styles from './TrackInfo.module.scss';

interface Props {
  img: string;
  title: string;
  id: string;
  user: SoundCloud.User;
}

export const TrackInfo = React.memo<Props>(({ img, title, id, user }) => {
  const isLiked = useSelector(hasLiked(id));
  const dispatch = useDispatch();

  const toggleLike = useCallback(() => {
    dispatch(actions.toggleLike.request(id));
  }, [dispatch, id]);

  return (
    <div className={styles.trackInfo}>
      <div className={styles.playerAlbum}>
        <a
          className={cn(styles.trackLike, { [styles.trackLike__liked]: isLiked })}
          href="javascript:void(0)"
          onClick={toggleLike}>
          <i className={`bx ${isLiked ? 'bxs-heart' : 'bx-heart'}`} />
        </a>
        <FallbackImage noPlaceholder fluid src={img} />
      </div>
      <div className={styles.trackDetails}>
        <Link className={styles.trackTitle} to={`/track/${id}`}>
          <TextShortener text={title} />
        </Link>
        <Link className={styles.trackArtist} to={`/user/${user.id}`}>
          <TextShortener text={user.username} />
        </Link>
      </div>
    </div>
  );
});
