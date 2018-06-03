import React from 'react'
import PropTypes from 'prop-types'
import { Col } from 'reactstrap'
import cn from 'classnames'
import { IMAGE_SIZES } from '../../../../shared/constants/index'
import { abbreviate_number, SC } from '../../../../shared/utils/index'
import TogglePlayButton from '../togglePlay.component'
import FallbackImage from '../FallbackImage'
import './trackGridItem.scss'
import TextTruncate from 'react-dotdotdot'
import ActionsDropdown from '../actionsDropDown.component'
import { getReadableTime } from '../../../../shared/utils/appUtils'
import { Link } from 'react-router-dom'

class TrackGridItem extends React.Component {

    constructor() {
        super()

        this.renderArtist = this.renderArtist.bind(this)
        this.renderInfo = this.renderInfo.bind(this)
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

    componentDidMount() {
        const { track, playlist, playlist_exists, fetchPlaylistIfNeededFunc } = this.props

        if (playlist && playlist_exists && track.track_count && !track.tracks) {
            fetchPlaylistIfNeededFunc(track.id)
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const { track, fetchPlaylistIfNeededFunc } = this.props

        if (nextProps.track.id !== track.id) {

            if (nextProps.playlist && nextProps.playlist_exists && nextProps.track.track_count && !nextProps.track.tracks) {
                fetchPlaylistIfNeededFunc(nextProps.track.id)
            }
        }
    }

    renderArtist() {
        const { repost, track } = this.props

        if (repost && track.from_user) {
            return (
                <div className="trackArtist">
                    <Link to={`/user/${track.user.id}`}>
                        {
                            track.user.username
                        }
                    </Link>
                    <i className="icon-retweet" />

                    <Link to={`/user/${track.from_user.id}`} className="repost">
                        {track.from_user.username}
                    </Link>
                </div>
            )
        }

        return (
            <div className="trackArtist">
                <Link to={`/user/${track.user.id}`}>
                    {track.user.username}
                </Link>
            </div>
        )
    }

    renderToggleButton() {
        const { isPlaying, playTrackFunc } = this.props

        if (isPlaying) {
            return <TogglePlayButton className="toggleButton minimal" />
        }

        const icon = isPlaying ? 'pause' : 'play_arrow'

        return (

            <a className="toggleButton minimal" onClick={playTrackFunc}>
                <i className={`icon-${icon}`} />
            </a>
        )
    }

    renderStats() {
        const { track, showInfo, toggleLike, liked, show, addUpNext, reposted, toggleRepost } = this.props

        return (
            <div className="trackFooter d-flex justify-content-between align-items-center">
                <div className="trackStats">
                    {
                        showInfo ? (<div>
                            <div className="stat">
                                <i className="icon-favorite_border" />
                                <span>{abbreviate_number(track.likes_count)}</span>
                            </div>
                            <div className="stat">
                                <i className="icon-retweet" />
                                <span>{abbreviate_number(track.reposts_count)}</span>
                            </div>
                        </div>) : null
                    }
                </div>

                <div>
                    <ActionsDropdown
                        toggleLike={toggleLike}
                        toggleRepost={toggleRepost}
                        reposted={reposted}
                        liked={liked}
                        show={show}
                        track={track}
                        addUpNext={addUpNext} />
                    <div className="trackTime">
                        <i className="icon-clock" />
                        <span>{getReadableTime(track.duration, true, true)}</span>
                    </div>
                </div>


            </div>
        )
    }

    renderInfo() {
        const { playlist, track } = this.props

        let object_url = (playlist ? '/playlist/' : '/track/') + track.id

        if (track.info && track.info.type.indexOf('like') !== -1) {
            return (
                <div className="trackInfo flex align-items-center">
                    <i className="icon icon-favorite" />

                    <div>
                        <div className="trackTitle">
                            <Link to={object_url}>
                                <TextTruncate
                                    clamp={1}
                                >{track.title}</TextTruncate>

                            </Link>
                        </div>
                        {
                            this.renderArtist()
                        }
                    </div>

                </div>
            )
        }

        return (
            <div className="trackInfo">
                <div className="trackTitle">
                    <Link to={object_url}>
                        <TextTruncate
                            clamp={1}
                        >{track.title}</TextTruncate>
                    </Link>
                </div>
                {
                    this.renderArtist()
                }

            </div>
        )
    }


    render() {

        const {
            isPlaying,
            track,
            playlist
        } = this.props

        const image = SC.getImageUrl(track, IMAGE_SIZES.LARGE)

        return (
            <Col xs="12" sm="6" lg="4" className={cn('trackWrapper', {
                'playlist': playlist
            })}>
                <div className={cn(
                    'track-grid-item', track.id,
                    {
                        'isPlaying': isPlaying,
                        'playlist': playlist
                    }
                )}>

                    <div className="trackImage">
                        <div className="imageWrapper">
                            {
                                playlist ? (
                                    <div
                                        className="trackCount d-flex align-items-center justify-content-center flex-column">
                                        <span>{track.track_count}</span> <span>tracks</span>
                                    </div>
                                ) : null
                            }
                            <FallbackImage
                                id={track.id}
                                src={image} />
                            {
                                track.streamable || track.kind === 'playlist' ? this.renderToggleButton() : null
                            }
                        </div>

                        {
                            this.renderStats()
                        }
                        {
                            track.genre ? <a className="trackGenre">{track.genre}</a> : null
                        }

                    </div>

                    {
                        this.renderInfo()
                    }


                </div>
            </Col>
        )
    }
}

TrackGridItem.propTypes = {
    playTrackFunc: PropTypes.func.isRequired,
    isPlaying: PropTypes.bool,
    showInfo: PropTypes.bool,
    playlist: PropTypes.bool,
    repost: PropTypes.bool,
    playlist_exists: PropTypes.bool,
    liked: PropTypes.bool,
    reposted: PropTypes.bool,
    track: PropTypes.object.isRequired,


    fetchPlaylistIfNeededFunc: PropTypes.func.isRequired,
    show: PropTypes.func.isRequired,
    toggleLike: PropTypes.func.isRequired,
    toggleRepost: PropTypes.func.isRequired,
    addUpNext: PropTypes.func.isRequired
}

export default TrackGridItem
