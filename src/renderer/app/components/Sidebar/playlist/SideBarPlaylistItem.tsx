import { getNormalizedPlaylist } from '@common/store/entities/selectors';
import { PlayerStatus } from '@common/store/player';
import { getPlayerStatusSelector } from '@common/store/player/selectors';
import classNames from 'classnames';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { TextShortener } from '../../../../_shared/TextShortener';
import * as styles from '../Sidebar.module.scss';

interface Props {
  playlistId: number;
  isPlaying: boolean;
}

const SideBarPlaylistItem: FC<Props> = ({ playlistId, isPlaying }) => {
  const playlist = useSelector(state => getNormalizedPlaylist(playlistId)(state));
  const playerStatus = useSelector(getPlayerStatusSelector);
  const isActuallyPlaying = playerStatus === PlayerStatus.PLAYING;

  if (!playlist) {
    return null;
  }

  return (
    <div
      className={classNames(styles.navItem, {
        isCurrentPlaylist: isPlaying,
        isActuallyPlaying
      })}>
      <NavLink to={`/playlist/${playlist.id}`} className={styles.navLink} activeClassName="active">
        <TextShortener text={playlist.title} />
      </NavLink>
    </div>
  );
};

export default SideBarPlaylistItem;
