import cn from 'classnames';
import { isEqual } from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_SIZES } from '../../../../../common/constants/Soundcloud';
import { PlayingTrack, playTrack } from '../../../../../common/store/player';
import * as SC from '../../../../../common/utils/soundcloudUtils';
import { SoundCloud } from '../../../../../types';
import ActionsDropdown from '../../../_shared/ActionsDropdown';
import FallbackImage from '../../../_shared/FallbackImage';
import TextShortener from '../../../_shared/TextShortener';

interface Props {
    track: SoundCloud.Track;
    trackData: PlayingTrack;
    index: number;
    currentPlaylist: string;

    played: boolean;
    playing: boolean;

    playTrack: typeof playTrack;
}

class QueueItem extends React.Component<Props> {

    shouldComponentUpdate(nextProps: Props) {
        const { track, playing, played } = this.props;

        return !isEqual(nextProps.track, track) ||
            !isEqual(nextProps.playing, playing) ||
            !isEqual(nextProps.played, played);
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

        } = this.props;


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
            <div>
                <div
                    role='button'
                    tabIndex={0}
                    className={cn('track d-flex flex-nowrap align-items-center', {
                        played,
                        playing
                    })}
                    onClick={(e) => {
                        if ((e.target as any).className !== 'icon-more_horiz') {
                            playTrack(currentPlaylist, trackData);
                        }
                    }}
                >
                    <div className='image-wrap'>
                        <FallbackImage
                            src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)}
                            width={40}
                            height={40}
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
                                <TextShortener text={track.title} />
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
                    <div className='no-shrink pl-2'>
                        <ActionsDropdown
                            index={index}
                            track={track}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default QueueItem;
