/* eslint-disable jsx-a11y/click-events-have-key-events */
import cn from 'classnames';
import { isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import TextTruncate from 'react-dotdotdot';
import { Link } from 'react-router-dom';
import { IMAGE_SIZES } from '../../../../../shared/constants/Soundcloud';
import * as SC from '../../../../../shared/utils/soundcloudUtils';
import ActionsDropdown from '../../../_shared/ActionsDropdown';
import FallbackImage from '../../../_shared/FallbackImage';
import './queue.scss';

class QueueItem extends React.Component {

    shouldComponentUpdate(nextProps) {
        const { track, playing, played } = this.props;

        return !isEqual(nextProps.track, track) ||
            !isEqual(nextProps.playing, playing) ||
            !isEqual(nextProps.played, played)
    }

    render() {
        const {
            // Vars
            track,
            index,
            currentPlaylist,
            playing,
            played,
            trackData,

            // Functions
            playTrack,

        } = this.props


        if (!track || !track.user || (track && track.loading && !track.title)) return (
            <div className="track d-flex flex-nowrap align-items-center">
                <div className="image-wrap">
                    <svg width="40" height="40">
                        <rect width="40" height="40" style={{ fill: '#eeeeee' }} />
                        Sorry, your browser does not support inline SVG.
                    </svg>
                </div>
                <div className="item-info">
                    <div className="title">
                        <svg width="150" height="14">
                            <rect width="150" height="14" style={{ fill: '#eeeeee' }} />
                            Sorry, your browser does not support inline SVG.
                        </svg>

                    </div>
                    <div className="stats">
                        <svg width="50" height="14">
                            <rect width="50" height="14" style={{ fill: '#eeeeee' }} />
                            Sorry, your browser does not support inline SVG.
                        </svg>
                    </div>
                </div>
            </div>
        )


        return (
            <div>
                <div role="button" tabIndex={0} className={cn('track d-flex flex-nowrap align-items-center', {
                    played,
                    playing
                })} onClick={(e) => {
                    if (e.target.className !== "icon-more_horiz") {
                        playTrack(currentPlaylist, trackData)
                    }
                }}>
                    <div className="image-wrap">
                        <FallbackImage
                            src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)}
                            width={40}
                            height={40}
                        />
                    </div>
                    <div className="item-info">
                        <div className="title">
                            <Link onClick={(e) => {
                                e.stopPropagation()
                                e.nativeEvent.stopImmediatePropagation()
                            }}
                                to={`/track/${track.id}`}>
                                <TextTruncate
                                    clamp={1}
                                >
                                    {track.title}
                                </TextTruncate>
                            </Link>

                        </div>
                        <div className="stats">
                            <Link onClick={(e) => {
                                e.stopPropagation()
                                e.nativeEvent.stopImmediatePropagation()
                            }}
                                to={`/user/${track.user.id}`}>{track.user.username}</Link>
                        </div>
                    </div>
                    <div className="no-shrink pl-2">
                        <ActionsDropdown
                            index={index}
                            track={track} />
                    </div>
                </div>
            </div>
        )
    }
}

QueueItem.propTypes = {
    track: PropTypes.object.isRequired,
    trackData: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    currentPlaylist: PropTypes.string,

    played: PropTypes.bool.isRequired,
    playing: PropTypes.bool.isRequired,

    playTrack: PropTypes.func.isRequired,
}

QueueItem.defaultProps = {
    currentPlaylist: null
}

export default QueueItem
