import { StoreState } from '@common/store';
import { getNormalizedPlaylist } from '@common/store/entities/selectors';
import { PlayerStatus } from '@common/store/player';
import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { TextShortener } from '../../../../_shared/TextShortener';
import * as styles from '../Sidebar.module.scss';

const mapStateToProps = (state: StoreState, props: OwnProps) => {
  const { playlistId } = props;
  const {
    player: { status }
  } = state;

  return {
    playlist: getNormalizedPlaylist(playlistId)(state),
    isActuallyPlaying: status === PlayerStatus.PLAYING
  };
};

interface OwnProps {
  playlistId: number;
  isPlaying: boolean;
}

type PropsFromState = ReturnType<typeof mapStateToProps>;

type AllProps = OwnProps & PropsFromState;

const SideBarPlaylistItem = React.memo<AllProps>(({ playlist, isPlaying, isActuallyPlaying }) => {
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
});

export default connect<PropsFromState, {}, OwnProps, StoreState>(mapStateToProps)(SideBarPlaylistItem);
