import cn from 'classnames';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import CustomScroll from '../../../_shared/CustomScroll';
import SideBarPlaylist from './playlist/SideBarPlaylist';

class SideBar extends React.Component {

    shouldComponentUpdate(nextProps) {
        const { playing, playlists, location, currentPlaylistId } = this.props;

        return !isEqual(playing, nextProps.playing) ||
            !isEqual(playlists, nextProps.playlists) ||
            !isEqual(location, nextProps.location) ||
            !isEqual(currentPlaylistId, nextProps.currentPlaylistId)
    }

    render() {
        const { playlists, playing, currentPlaylistId } = this.props

        return (

            <aside id="sidebar"
                role="navigation"
                className={cn('sidebar-offcanvas d-flex flex-column', {
                    'test': process.env.TOKEN,
                    playing
                })}>

                <div className="drag-strip" />

                <CustomScroll heightRelativeToParent="100%"
                    allowOuterScroll>
                    <div key="sidebar-menu" id="sidebar-menu">
                        <h2>Discover</h2>
                        <ul className="nav flex-column">
                            <li className="navItem">
                                <NavLink exact to="/" className="navLink" activeClassName="active">
                                    Stream
                                </NavLink>
                            </li>
                            <li className="navItem">
                                <NavLink exact to="/charts" className="navLink" activeClassName="active">
                                    Charts
                                </NavLink>
                            </li>
                        </ul>

                        <h2>Me</h2>
                        <ul className="nav flex-column">
                            <li className="navItem" id="likes">
                                <NavLink to="/likes" className="navLink" activeClassName="active">
                                    Likes
                                </NavLink>
                            </li>
                            <li className="navItem" id="mytracks">
                                <NavLink to="/mytracks" className="navLink" activeClassName="active">
                                    Tracks
                                </NavLink>
                            </li>
                            <li className="navItem" id="myplaylists">
                                <NavLink to="/myplaylists" className="navLink" activeClassName="active">
                                    Playlists
                                </NavLink>
                            </li>
                        </ul>
                        <h2>Playlists</h2>
                        <div id="playlists" className="nav flex-column">
                            <SideBarPlaylist playlists={playlists} currentPlaylistId={currentPlaylistId} />
                        </div>
                    </div>
                </CustomScroll>
            </aside>
        )
    }
}

SideBar.propTypes = {
    playlists: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired,
    playing: PropTypes.bool,
    currentPlaylistId: PropTypes.string
}
SideBar.defaultProps = {
    playing: false,
    currentPlaylistId: ""
}

export default withRouter(SideBar)
