import cn from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import TextTruncate from 'react-dotdotdot';
import { Link } from 'react-router-dom';
import { IMAGE_SIZES } from '../../../../shared/constants';
import { abbreviate_number, getReadableTime, SC } from '../../../../shared/utils';
import ActionsDropdown from '../ActionsDropdown';
import FallbackImage from '../FallbackImage';
import TogglePlayButton from '../TogglePlayButton';
import './trackListItem.scss';

class trackListItem extends React.Component {

    state = {
        dropdownOpen: false
    }

    shouldComponentUpdate(nextProps) {

        const { track, isPlaying } = this.props

        if (nextProps.track.id !== track.id) {
            return true
        }

        if (nextProps.isPlaying !== isPlaying) {
            return true
        }

        return false

    }

    toggle = () => {
        const { dropdownOpen } = this.state;

        this.setState({
            dropdownOpen: !dropdownOpen
        })
    }

    renderToggleButton = () => {
        const { isPlaying, playTrackFunc } = this.props

        if (isPlaying) {
            return <TogglePlayButton className="toggleButton" />
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
            // Functions
            playTrackFunc
        } = this.props

        if (!track.title) return null

        return (
            <tr className={cn('trackItem', { isPlaying })} onDoubleClick={playTrackFunc.bind(null, false)}>
                <td>
                    <div className="img-with-shadow">
                        <FallbackImage src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)} />
                        <FallbackImage overflow className="shadow" src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)} />
                        {
                            track.streamable || (track.policy && track.policy === "ALLOW") ? this.renderToggleButton() : null
                        }
                    </div>
                </td>
                <td>
                    <div className="trackTitle">
                        <Link to={`/track/${track.id}`}>
                            <TextTruncate
                                clamp={1}
                                ellipsis="..."
                            >{track.title}</TextTruncate>
                        </Link>
                    </div>
                    <div className="stats d-flex align-items-center">
                        <i className='bx bxs-heart' />

                        <span>{abbreviate_number(track.likes_count || track.favoritings_count)}</span>

                        <i className='bx bx-repost' />
                        <span>{abbreviate_number(track.reposts_count)}</span>

                    </div>
                </td>

                <td className="trackArtist">
                    <Link to={`/user/${track.user_id}`}>
                        {track.user.username}
                    </Link>
                </td>
                <td className="time">
                    {getReadableTime(track.duration, true, true)}
                </td>
                <td className="trackitemActions">
                    <ActionsDropdown
                        track={track} />
                </td>
            </tr>
        )
    }
}

trackListItem.propTypes = {
    isPlaying: PropTypes.bool.isRequired,
    track: PropTypes.object.isRequired,

    playTrackFunc: PropTypes.func.isRequired
}


export default trackListItem
