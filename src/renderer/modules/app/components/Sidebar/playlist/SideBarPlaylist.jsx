import React from 'react'
import PropTypes from 'prop-types'
import TextTruncate from 'react-dotdotdot'
import { NavLink, withRouter } from 'react-router-dom'
import isEqual from 'lodash/isEqual'

class SideBarPlaylist extends React.Component {
    static propTypes = {
        playlists: PropTypes.array.isRequired,
        currentPlaylistId: PropTypes.string
    }

    static defaultProps = {
        playlists: []
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return !isEqual(this.props.playlists.length, nextProps.playlists.length) ||
            !isEqual(this.props.location, nextProps.location) ||
            !isEqual(this.props.currentPlaylistId, nextProps.currentPlaylistId)
    }

    render() {
        const { playlists, currentPlaylistId } = this.props

        return (
            <div>
                {
                    playlists.map((playlist, i) => {
                        return (
                            <li key={`sidebar-${playlist.id}`}
                                className={`navItem ${playlist.id === +currentPlaylistId ? 'playing' : null}`}>
                                <NavLink to={'/playlist/' + playlist.id}
                                         className="navLink"
                                         activeClassName="active">
                                    <TextTruncate
                                        clamp={1}
                                    >
                                        {playlist.title}
                                    </TextTruncate>
                                </NavLink>
                            </li>
                        )
                    })
                }
            </div>
        )
    }
}

export default withRouter(SideBarPlaylist)
