import { Normalized } from '@types';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars';
import { NavLink, RouteComponentProps, withRouter } from 'react-router-dom';
import SideBarPlaylistItem from './playlist/SideBarPlaylistItem';
import * as styles from './Sidebar.module.scss';

interface Props {
  items: Normalized.NormalizedResult[];
  isActuallyPlaying: boolean;
  currentPlaylistId: string | null;
}

type AllProps = Props & RouteComponentProps;

const SideBar = React.memo<AllProps>(({ items, currentPlaylistId }) => (
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
          {items.map(normalizedResult => {
            const isPlaying = !!currentPlaylistId && normalizedResult.id.toString() === currentPlaylistId;

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
));

export default withRouter(SideBar);
