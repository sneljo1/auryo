import cn from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
import FallbackImage from '../../../../../_shared/FallbackImage';
import { TextShortener } from '../../../../../_shared/TextShortener';
import * as styles from './TrackInfo.module.scss';

interface Props {
  img: string;
  title: string;
  id: string;
  userId: string;
  username: string;

  liked: boolean;
  toggleLike(): void;
}

export const TrackInfo = React.memo<Props>(({ img, title, id, userId, username, liked, toggleLike }) => (
  <div className={styles.trackInfo}>
    <div className={styles.playerAlbum}>
      <a
        className={cn(styles.trackLike, { [styles.trackLike__liked]: liked })}
        href="javascript:void(0)"
        onClick={toggleLike}>
        <i className={`bx ${liked ? 'bxs-heart' : 'bx-heart'}`} />
      </a>
      <FallbackImage noPlaceholder fluid src={img} />
    </div>
    <div className={styles.trackDetails}>
      <Link className={styles.trackTitle} to={`/track/${id}`}>
        <TextShortener text={title} />
      </Link>
      <Link className={styles.trackArtist} to={`/user/${userId}`}>
        <TextShortener text={username} />
      </Link>
    </div>
  </div>
));
