import React from 'react'
import PropTypes from 'prop-types'
import './sidebar.scss'
import cn from 'classnames'
import SideBarPlaylist from './playlist/SideBarPlaylist'
import { NavLink, withRouter } from 'react-router-dom'
import isEqual from 'lodash/isEqual'
import CustomScroll from '../../../_shared/CustomScroll'

class SideBar extends React.Component {

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return !isEqual(this.props.playing, nextProps.playing) ||
            !isEqual(this.props.playlists, nextProps.playlists) ||
            !isEqual(this.props.location, nextProps.location) ||
            !isEqual(this.props.currentPlaylistId, nextProps.currentPlaylistId)
    }

    render() {
        const { playlists, playing,currentPlaylistId } = this.props

        return (

            <aside id="sidebar"
                   role="navigation"
                   className={cn('sidebar-offcanvas d-flex flex-column', {
                       'test': process.env.TOKEN,
                       'playing': playing
                   })}>

                <div className="drag-strip" />

                <CustomScroll heightRelativeToParent="100%"
                              allowOuterScroll={true}>
                    <div id="sidebar-menu">
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
                            <SideBarPlaylist playlists={playlists} currentPlaylistId={currentPlaylistId}/>
                        </div>
                    </div>
                </CustomScroll>
            </aside>
        )
    }
}

SideBar.propTypes = {
    playlists: PropTypes.array.isRequired,
    playing: PropTypes.bool,
    currentPlaylistId: PropTypes.string
}

SideBar.defaultProps = {
    playlists: []
}

export default withRouter(SideBar)
