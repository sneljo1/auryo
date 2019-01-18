
import cn from 'classnames';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link } from 'react-router-dom';
import { IMAGE_SIZES } from '../../../../common/constants';
import { StoreState } from '../../../../common/store';
import { abbreviate_number, SC } from '../../../../common/utils';
import { getReadableTime } from '../../../../common/utils/appUtils';
import { NormalizedResult, SoundCloud } from '../../../../types';
import ActionsDropdown from '../../ActionsDropdown';
import FallbackImage from '../../FallbackImage';
import TextShortener from '../../TextShortener';
import TogglePlayButton from '../../TogglePlayButton';
import { playTrack, PlayingTrack } from '../../../../common/store/player';
import { fetchPlaylistIfNeeded } from '../../../../common/store/objects';
import { bindActionCreators } from 'redux';
import { isPlaying } from '../../../../common/store/player/selectors';
import { getMusicEntity } from '../../../../common/store/entities/selectors';
import * as _ from 'lodash';
import * as isDeepEqual from 'react-fast-compare';
import './TrackGridItem.scss';

interface OwnProps {
    idResult: NormalizedResult;
    isPlaying: boolean;
    currentPlaylistId: string;
    showInfo?: boolean;
    showReposts: boolean;
    skipFetch?: boolean;
}

interface PropsFromState {
    isPlaying: boolean;
    track: SoundCloud.Music | null;
}

interface PropsFromDispatch {
    playTrack: typeof playTrack;
    fetchPlaylistIfNeeded: typeof fetchPlaylistIfNeeded;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class TrackGridItem extends React.Component<AllProps> {

    static defaultProps: Partial<AllProps> = {
        showInfo: false
    };

    componentDidMount() {
        const { track, fetchPlaylistIfNeeded, skipFetch } = this.props;

        if (track && track.kind === 'playlist' && track.track_count && !track.tracks && !skipFetch) {
            fetchPlaylistIfNeeded(track.id);
        }
    }

    shouldComponentUpdate(nextProps: AllProps) {

        if (!isDeepEqual(nextProps, this.props)) {
            return true;
        }

        return false;
    }

    componentDidUpdate(prevProps: AllProps) {
        const { track, fetchPlaylistIfNeeded, skipFetch } = this.props;

        if ((prevProps.track === null && track != null) || (prevProps.track && track && prevProps.track.id !== track.id) && !skipFetch) {
            if (track.kind === 'playlist' && track.track_count && !track.tracks) {
                fetchPlaylistIfNeeded(track.id);
            }
        }
    }

    renderArtist = () => {
        const { track, showReposts } = this.props;

        if (!track || !track.user) return null;

        if (track.from_user && showReposts) {
            return (
                <div className='trackArtist'>
                    <Link to={`/user/${track.user.id}`}>
                        {
                            track.user.username
                        }
                    </Link>
                    <i className='bx bx-repost' />

                    <Link to={`/user/${track.from_user.id}`} className='repost'>
                        {track.from_user.username}
                    </Link>
                </div>
            );
        }

        return (
            <div className='trackArtist'>
                <Link to={`/user/${track.user.id}`}>
                    {track.user.username}
                </Link>
            </div>
        );
    }

    renderToggleButton = () => {
        const { isPlaying, playTrack, currentPlaylistId, track } = this.props;

        if (!track) return null;

        if (isPlaying) {
            return <TogglePlayButton className='toggleButton minimal' />;
        }

        const icon = isPlaying ? 'pause' : 'play';

        let next: Partial<PlayingTrack> = { id: track.id };

        if (track.kind === 'playlist') {
            next = { playlistId: track.id.toString() };
        }

        return (
            <a
                href='javascript:void(0)'
                className='toggleButton minimal'
                onClick={() => {
                    playTrack(currentPlaylistId, next as PlayingTrack, true);
                }}
            >
                <i className={`bx bx-${icon}`} />
            </a>
        );
    }

    renderStats() {
        const { track, showInfo, currentPlaylistId } = this.props;

        if (!track || !track.user) return null;

        const isLiked = track.type && track.type.indexOf('like') !== -1;

        return (
            <div className='trackFooter d-flex justify-content-between align-items-center'>
                <div className='trackStats'>
                    {
                        showInfo ? (
                            <>
                                <div className='stat'>
                                    <i className='bx bxs-heart' />
                                    <span>{abbreviate_number(track.likes_count)}</span>
                                </div>
                                <div className='stat'>
                                    <i className='bx bx-repost' />
                                    <span>{abbreviate_number(track.reposts_count)}</span>
                                </div>
                            </>
                        ) : null
                    }
                    {
                        isLiked && (
                            <><span className='stat'><i className='bx bxs-heart text-danger' /> Liked</span></>
                        )
                    }

                    {
                        // !showInfo && !isLiked && track.kind === 'playlist' && (
                        //     <><span className='stat'>
                        //         <i className={`bx bx-${track.sharing === 'public' ? 'lock-open' : 'lock'}`} />
                        //         {track.sharing === 'public' ? 'Public' : 'Private'}</span>
                        //     </>

                        // )
                    }

                </div>

                <div>
                    <ActionsDropdown
                        track={track}
                        currentPlaylistId={currentPlaylistId}
                    />

                    <div className='trackTime'>
                        <i className='bx bx-alarm' />
                        <span>{getReadableTime(track.duration, true, true)}</span>
                    </div>
                </div>


            </div>
        );
    }

    renderInfo() {
        const { track } = this.props;

        if (!track) return null;

        const object_url = (track.kind === 'playlist' ? '/playlist/' : '/track/') + track.id;

        return (
            <div className='trackInfo'>
                <div className='trackTitle'>
                    <Link to={object_url}>
                        <TextShortener text={track.title} />
                    </Link>
                </div>
                {
                    this.renderArtist()
                }
            </div>
        );
    }


    render() {

        const {
            isPlaying,
            track
        } = this.props;

        const image = SC.getImageUrl(track, IMAGE_SIZES.LARGE);

        if (!track || !track.user) return null;

        return (
            <div
                className={cn('trackWrapper col-12 col-sm-6 col-lg-4', {
                    playlist: track.kind === 'playlist'
                })}
            >
                <div
                    className={cn(
                        'track-grid-item', track.id,
                        {
                            isPlaying,
                            playlist: track.kind === 'playlist'
                        }
                    )}
                >

                    <div className='trackImage'>
                        <div className='imageWrapper'>
                            {
                                track.kind === 'playlist' ? (
                                    <div
                                        className='trackCount d-flex align-items-center justify-content-center flex-column'
                                    >
                                        <span>{track.track_count}</span> <span>tracks</span>
                                    </div>
                                ) : null
                            }
                            <FallbackImage
                                src={image}
                            />
                            {
                                SC.isStreamable(track) || track.kind === 'playlist' ? this.renderToggleButton() : null
                            }
                        </div>

                        {
                            this.renderStats()
                        }
                        {
                            track.genre && track.genre !== '' ? <Link to={`/tags/${track.genre}`} className='trackGenre'>{track.genre}</Link> : null}

                    </div>

                    {
                        this.renderInfo()
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { idResult, currentPlaylistId } = props;

    return {
        isPlaying: isPlaying(idResult, currentPlaylistId)(state),
        track: getMusicEntity(idResult)(state)
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    playTrack,
    fetchPlaylistIfNeeded
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(TrackGridItem);
