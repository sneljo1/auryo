import { getAuthPlaylistsSelector, getCurrentPlaylistId } from '@common/store/selectors';
import { PlaylistTypes } from '@common/store/types';
import React, { FC } from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { useSelector } from 'react-redux';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import SideBarPlaylistItem from './playlist/SideBarPlaylistItem';
import * as styles from './Sidebar.module.scss';

type AllProps = RouteComponentProps;

const SideBar: FC<AllProps> = () => {
  const authPlaylists = useSelector(state => getAuthPlaylistsSelector(state).owned);
  const currentPlaylistId = useSelector(state => getCurrentPlaylistId(state));

  return (
    <aside id="sidebar" role="navigation" className={styles.sidebar}>
      <div className={styles.dragStrip} />

      <Scrollbars
        renderTrackHorizontal={() => <div />}
        renderTrackVertical={props => <div {...props} className="track-vertical" />}
        renderThumbHorizontal={() => <div />}
        renderThumbVertical={props => <div {...props} className="thumb-vertical" />}>
        <div id="sidebar-menu" className={styles.sidebarMenu}>
          <h2>Discover</h2>
          <ul className={styles.nav}>
            <li className={styles.navItem}>
              <NavLink exact to="/" className={styles.navLink} activeClassName="active">
                Stream
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink exact to="/charts" className={styles.navLink} activeClassName="active">
                Charts
              </NavLink>
            </li>
            <li className={styles.navItem}>
              <NavLink exact to="/foryou" className={styles.navLink} activeClassName="active">
                For you
              </NavLink>
            </li>
          </ul>

          <h2>Me</h2>
          <ul className={styles.nav}>
            <li className={styles.navItem} id="likes">
              <NavLink to="/likes" className={styles.navLink} activeClassName="active">
                Likes
              </NavLink>
            </li>
            <li className={styles.navItem} id="mytracks">
              <NavLink to="/mytracks" className={styles.navLink} activeClassName="active">
                Tracks
              </NavLink>
            </li>
            <li className={styles.navItem} id="myplaylists">
              <NavLink to="/myplaylists" className={styles.navLink} activeClassName="active">
                Playlists
              </NavLink>
            </li>
          </ul>

          <h2>Playlists</h2>
          <div id="playlists" className={styles.nav}>
            {authPlaylists.map(normalizedResult => {
              const isPlaying =
                currentPlaylistId?.playlistType === PlaylistTypes.PLAYLIST &&
                normalizedResult.id.toString() === currentPlaylistId.objectId;

              return (
                <SideBarPlaylistItem
                  key={`sidebar-item-${normalizedResult.id}`}
                  playlistId={normalizedResult.id}
                  isPlaying={isPlaying}
                />
              );
            })}
          </div>
        </div>
      </Scrollbars>
    </aside>
  );
};

export default withRouter(SideBar);
