import cn from 'classnames';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_SIZES } from '../../../../common/constants';
import { abbreviate_number, getReadableTime, SC } from '../../../../common/utils';
import { SoundCloud } from '../../../../types';
import ActionsDropdown from '../ActionsDropdown';
import FallbackImage from '../FallbackImage';
import TextShortener from '../TextShortener';
import TogglePlayButton from '../TogglePlayButton';

interface Props {
    track: SoundCloud.Track;
    isPlaying: boolean;

    playTrackFunc: (event: React.MouseEvent<any>, double?: boolean) => void;
}

class TrackListItem extends React.Component<Props> {

    shouldComponentUpdate(nextProps: Props) {

        const { track, isPlaying } = this.props;

        if (nextProps.track.id !== track.id) {
            return true;
        }

        if (nextProps.isPlaying !== isPlaying) {
            return true;
        }

        return false;

    }

    renderToggleButton = () => {
        const { isPlaying, playTrackFunc } = this.props;

        if (isPlaying) {
            return <TogglePlayButton className='toggleButton' />;
        }

        const icon = isPlaying ? 'pause' : 'play_arrow';

        return (

            <a
                href='javascript:void(0)'
                className='toggleButton'
                onClick={(e) => {
                    playTrackFunc(e, true);
                }}
            >
                <i className={`icon-${icon}`} />
            </a>
        );
    }

    render() {
        const {
            track,
            isPlaying,
            playTrackFunc
        } = this.props;

        if (!track.title) return null;

        return (
            <tr
                className={cn('trackItem', { isPlaying })}
                onDoubleClick={(e) => {
                    playTrackFunc(e);
                }}
            >
                <td>
                    <div className='img-with-shadow'>
                        <FallbackImage src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)} />
                        <FallbackImage overflow={true} className='shadow' src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)} />
                        {
                            track.streamable || (track.policy && track.policy === 'ALLOW') ? this.renderToggleButton() : null
                        }
                    </div>
                </td>
                <td>
                    <div className='trackTitle'>
                        <Link to={`/track/${track.id}`}>
                            <TextShortener text={track.title} />
                        </Link>
                    </div>
                    <div className='stats d-flex align-items-center'>
                        <i className='bx bxs-heart' />

                        <span>{abbreviate_number(track.likes_count)}</span>

                        <i className='bx bx-repost' />
                        <span>{abbreviate_number(track.reposts_count)}</span>

                    </div>
                </td>

                <td className='trackArtist'>
                    <Link to={`/user/${track.user_id}`}>
                        {track.user.username}
                    </Link>
                </td>
                <td className='time'>
                    {getReadableTime(track.duration, true, true)}
                </td>
                <td className='trackitemActions'>
                    <ActionsDropdown
                        track={track}
                    />
                </td>
            </tr>
        );
    }
}

export default TrackListItem;
