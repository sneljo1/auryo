import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { getReadableTime } from '../../../../shared/utils/index'
import TogglePlayButton from '../togglePlay.component'
import './trackListItem.scss'
import TextTruncate from 'react-dotdotdot'
import ActionsDropdown from '../actionsDropDown.component'
import { Link } from 'react-router-dom'

class trackListItem extends React.Component {

    state = {
        dropdownOpen: false
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {

        if (nextProps.track.id !== this.props.track.id) {
            return true
        }

        if (nextProps.isPlaying !== this.props.isPlaying) {
            return true
        }

        if (nextProps.liked !== this.props.liked) {
            return true
        }

        if (nextProps.reposted !== this.props.reposted) {
            return true
        }

        return false

    }

    toggle = () => {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        })
    }

    renderToggleButton = () => {
        const { isPlaying, playTrackFunc } = this.props

        if (isPlaying) {
            return <TogglePlayButton classname="toggleButton" />
        }

        const icon = isPlaying ? 'pause' : 'play_arrow'

        return (

            <a href="javascript:void(0)" className="toggleButton" onClick={playTrackFunc.bind(null, true)}>
                <i className={`icon-${icon}`} />
            </a>
        )
    }

    render() {
        const {
            track,
            isPlaying,
            liked,
            reposted,
            // Functions
            likeFunc,
            playTrackFunc,
            show,
            addUpNext,
            toggleRepost
        } = this.props

        if (!track.title) return null

        return (
            <tr className={cn('trackItem', { isPlaying: isPlaying })} onDoubleClick={playTrackFunc.bind(null, false)}>
                <td>
                    {
                        track.streamable ? this.renderToggleButton() : null
                    }
                </td>
                <td className="d-flex">
                    <div className="trackTitle">
                        <Link to={`/track/${track.id}`}>
                            <TextTruncate
                                clamp={1}
                                ellipsis="..."
                            >{track.title}</TextTruncate>
                        </Link>
                    </div>
                </td>

                <td className="trackArtist">
                    <Link to={'/user/' + track.user_id}>
                        {track.user.username}
                    </Link>
                </td>
                <td className="text-right">
                    {getReadableTime(track.duration, true, true)}
                </td>
                <td className="trackitemActions d-flex">
                    {/*<i className="icon-retweet"/>
                     <i className="icon-playlist_add"/>*/}

                    <ActionsDropdown
                        toggleLike={likeFunc}
                        toggleRepost={toggleRepost}
                        reposted={reposted}
                        liked={liked}
                        show={show}
                        track={track}
                        addUpNext={addUpNext} />
                </td>
            </tr>
        )
    }
}

trackListItem.propTypes = {
    isPlaying: PropTypes.bool.isRequired,
    track: PropTypes.object.isRequired,
    liked: PropTypes.bool.isRequired,
    reposted: PropTypes.bool.isRequired,

    show: PropTypes.func.isRequired,
    likeFunc: PropTypes.func.isRequired,
    playTrackFunc: PropTypes.func.isRequired,
    addUpNext: PropTypes.func.isRequired,
    toggleRepost: PropTypes.func.isRequired
}


export default trackListItem
