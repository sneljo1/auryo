import * as React from "react";
import { NavLink, RouteComponentProps, withRouter } from "react-router-dom";
import { NormalizedResult } from "../../../../types";
import CustomScroll from "../../../_shared/CustomScroll";
import SideBarPlaylistItem from "./playlist/SideBarPlaylistItem";
import * as styles from "./Sidebar.module.scss";

interface Props {
    items: NormalizedResult[];
    isActuallyPlaying: boolean;
    currentPlaylistId: string | null;
}

type AllProps = Props & RouteComponentProps;

const SideBar = React.memo<AllProps>(({ items, isActuallyPlaying, currentPlaylistId }) => (
    <aside
        id="sidebar"
        role="navigation"
        className={styles.sidebar}
    >
        <div className={styles.dragStrip} />

        <CustomScroll
            heightRelativeToParent="100%"
            allowOuterScroll={true}
        >
            <div id="sidebar-menu" className={styles.sidebarMenu}>
                <h2>Discover</h2>
                <ul className={styles.nav}>
                    <li className={styles.navItem}>
                        <NavLink exact={true} to="/" className={styles.navLink} activeClassName="active">
                            Stream
                        </NavLink>
                    </li>
                    <li className={styles.navItem}>
                        <NavLink exact={true} to="/charts" className={styles.navLink} activeClassName="active">
                            Charts
                        </NavLink>
                    </li>
                    <li className={styles.navItem}>
                        <NavLink exact={true} to="/foryou" className={styles.navLink} activeClassName="active">
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
                    {
                        items.map((normalizedResult) => {

                            const isPlaying = !!currentPlaylistId && normalizedResult.id.toString() === currentPlaylistId;

                            return (
                                <SideBarPlaylistItem
                                    key={`sidebar-item-${normalizedResult.id}`}
                                    playlistId={normalizedResult.id}
                                    isPlaying={isPlaying}
                                />
                            );
                        })
                    }
                </div>
            </div>
        </CustomScroll>
    </aside>
));

export default withRouter(SideBar);
