import cn from 'classnames';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link } from 'react-router-dom';
import ActionsDropdown from '../../../_shared/ActionsDropdown';
import FallbackImage from '../../../_shared/FallbackImage';
import TextShortener from '../../../_shared/TextShortener';
import { bindActionCreators } from 'redux';
import { PlayingTrack, playTrack } from '../../../../common/store/player';
import { SoundCloud } from '../../../../types';
import { SC } from '../../../../common/utils';
import { IMAGE_SIZES } from '../../../../common/constants';
import { StoreState } from '../../../../common/store';
import { getTrackEntity } from '../../../../common/store/entities/selectors';
import { getCurrentPlaylistId } from '../../../../common/store/player/selectors';

interface OwnProps {
    trackData: PlayingTrack;
    index: number;

    played: boolean;
    playing: boolean;
}

interface PropsFromState {
    track: SoundCloud.Track | null;
    currentPlaylistId: string | null;
}

interface PropsFromDispatch {
    playTrack: typeof playTrack;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class QueueItem extends React.PureComponent<AllProps> {

    render() {
        const {
            // Vars
            track,
            index,
            currentPlaylistId,
            playing,
            played,
            trackData,

            // Functions
            playTrack,

        } = this.props;

        if (!currentPlaylistId) return null;

        if (!track || !track.user || (track && track.loading && !track.title)) {
            return (
                <div className='track d-flex flex-nowrap align-items-center'>
                    <div className='image-wrap'>
                        <svg width='40' height='40'>
                            <rect width='40' height='40' style={{ fill: '#eeeeee' }} />
                            Sorry, your browser does not support inline SVG.
                    </svg>
                    </div>
                    <div className='item-info'>
                        <div className='title'>
                            <svg width='150' height='14'>
                                <rect width='150' height='14' style={{ fill: '#eeeeee' }} />
                                Sorry, your browser does not support inline SVG.
                        </svg>

                        </div>
                        <div className='stats'>
                            <svg width='50' height='14'>
                                <rect width='50' height='14' style={{ fill: '#eeeeee' }} />
                                Sorry, your browser does not support inline SVG.
                        </svg>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className='queueItem'>
                <div
                    role='button'
                    tabIndex={0}
                    className={cn('track d-flex flex-nowrap align-items-center', {
                        played,
                        playing
                    })}
                    onClick={(e) => {
                        if ((e.target as any).className !== 'bx bx-dots-horizontal-rounded') {
                            playTrack(currentPlaylistId, trackData);
                        }
                    }}
                >
                    <div className='image-wrap'>
                        <FallbackImage
                            src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)}
                            width={35}
                            height={35}
                        />
                    </div>
                    <div className='item-info'>
                        <div className='title'>
                            <Link
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                }}
                                to={`/track/${track.id}`}
                            >
                                <TextShortener text={track.title} clamp={1} />
                            </Link>

                        </div>
                        <div className='stats'>
                            <Link
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                }}
                                to={`/user/${track.user.id}`}
                            >
                                {track.user.username}
                            </Link>
                        </div>
                    </div>
                </div>

                <ActionsDropdown
                    index={index}
                    track={track}
                    playing={playing}
                />
            </div>
        );
    }
}

const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { trackData } = props;

    return {
        track: trackData ? getTrackEntity(trackData.id)(state) : null,
        currentPlaylistId: getCurrentPlaylistId(state)
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    playTrack
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(QueueItem);
