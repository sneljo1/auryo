
import cn from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
import { Col } from 'reactstrap';
import { IMAGE_SIZES } from '../../../../shared/constants';
import { abbreviate_number, SC } from '../../../../shared/utils';
import { getReadableTime } from '../../../../shared/utils/appUtils';
import { SoundCloud } from '../../../../types';
import ActionsDropdown from '../ActionsDropdown';
import FallbackImage from '../FallbackImage';
import TextShortener from '../TextShortener';
import TogglePlayButton from '../TogglePlayButton';


interface Props {
    track: SoundCloud.Music;
    isPlaying: boolean;
    showInfo?: boolean;
    showReposts: boolean;

    fetchPlaylistIfNeededFunc: () => void;
    playTrackFunc: () => void;
}

class TrackGridItem extends React.Component<Props> {

    static defaultProps: Partial<Props> = {
        showInfo: false
    }

    componentDidMount() {
        const { track, fetchPlaylistIfNeededFunc } = this.props

        if (track.kind === "playlist" && track.track_count && !track.tracks) {
            fetchPlaylistIfNeededFunc()
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        const { track, fetchPlaylistIfNeededFunc } = this.props

        if (nextProps.track.id !== track.id) {
            if (nextProps.track.kind === "playlist" && nextProps.track.track_count && !nextProps.track.tracks) {
                fetchPlaylistIfNeededFunc()
            }
        }
    }

    // shouldComponentUpdate(nextProps: Props) {
    //     const { track, isPlaying } = this.props

    //     if (nextProps.track.id !== track.id) {
    //         return true
    //     }

    //     if (nextProps.isPlaying !== isPlaying) {
    //         return true
    //     }

    //     return false

    // }

    renderArtist = () => {
        const { track, showReposts } = this.props

        if (track.from_user && showReposts) {
            return (
                <div className="trackArtist">
                    <Link to={`/user/${track.user.id}`}>
                        {
                            track.user.username
                        }
                    </Link>
                    <i className='bx bx-repost' />

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

    renderToggleButton = () => {
        const { isPlaying, playTrackFunc } = this.props

        if (isPlaying) {
            return <TogglePlayButton className="toggleButton minimal" />
        }

        const icon = isPlaying ? 'pause' : 'play_arrow'

        return (
            <a href="javascript:void(0)" className="toggleButton minimal" onClick={playTrackFunc}>
                <i className={`icon-${icon}`} />
            </a>
        )
    }

    renderStats() {
        const { track, showInfo } = this.props

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
                                <i className='bx bx-repost' />
                                <span>{abbreviate_number(track.reposts_count)}</span>
                            </div>
                        </div>) : null
                    }
                </div>

                <div>
                    <ActionsDropdown
                        track={track} />

                    <div className="trackTime">
                        <i className="icon-clock" />
                        <span>{getReadableTime(track.duration, true, true)}</span>
                    </div>
                </div>


            </div>
        )
    }

    renderInfo() {
        const { track } = this.props

        const object_url = (track.kind === "playlist" ? '/playlist/' : '/track/') + track.id

        // TODO check if liked playlists still work
        // if (track.info && track.info.type.indexOf('like') !== -1) {
        //     return (
        //         <div className="trackInfo flex align-items-center">
        //             <i className="icon icon-favorite" />
        //             <div>
        //                 <div className="trackTitle">
        //                     <Link to={object_url}>
        //                         <TextShortener text={track.title} />
        //                     </Link>
        //                 </div>
        //                 {
        //                     this.renderArtist()
        //                 }
        //             </div>
        //         </div>
        //     )
        // }

        return (
            <div className="trackInfo">
                <div className="trackTitle">
                    <Link to={object_url}>
                        <TextShortener text={track.title} />
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
            track
        } = this.props

        const image = SC.getImageUrl(track, IMAGE_SIZES.LARGE)

        return (
            <Col xs="12" sm="6" lg="4" className={cn('trackWrapper', {
                'playlist': track.kind === "playlist"
            })}>
                <div className={cn(
                    'track-grid-item', track.id,
                    {
                        'isPlaying': isPlaying,
                        'playlist': track.kind === "playlist"
                    }
                )}>

                    <div className="trackImage">
                        <div className="imageWrapper">
                            {
                                track.kind === "playlist" ? (
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
                                (track.streamable || (track.policy && track.policy === "ALLOW")) || track.kind === 'playlist' ? this.renderToggleButton() : null
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

export default TrackGridItem
