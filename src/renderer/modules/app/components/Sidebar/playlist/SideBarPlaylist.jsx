import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React from 'react';
import TextTruncate from 'react-dotdotdot';
import { NavLink, withRouter } from 'react-router-dom';

class SideBarPlaylist extends React.Component {

    shouldComponentUpdate(nextProps) {
        const { playlists, location, currentPlaylistId } = this.props;

        return !isEqual(playlists.length, nextProps.playlists.length) ||
            !isEqual(location, nextProps.location) ||
            !isEqual(currentPlaylistId, nextProps.currentPlaylistId)
    }

    render() {
        const { playlists, currentPlaylistId } = this.props

        return (
            <React.Fragment>
                {
                    playlists.map((playlist) => (
                        <div key={`sidebar-${playlist.id}`}
                            className={`navItem ${playlist.id === +currentPlaylistId ? 'playing' : null}`}>
                            <NavLink to={`/playlist/${playlist.id}`}
                                className="navLink"
                                activeClassName="active">
                                <TextTruncate
                                    clamp={1}
                                >
                                    {playlist.title}
                                </TextTruncate>
                            </NavLink>
                        </div>
                    ))
                }
            </React.Fragment>
        )
    }
}

SideBarPlaylist.propTypes = {
    playlists: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired,
    currentPlaylistId: PropTypes.string
}

SideBarPlaylist.defaultProps = {
    currentPlaylistId: null
}
export default withRouter(SideBarPlaylist)
