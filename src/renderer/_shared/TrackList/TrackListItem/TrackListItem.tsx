import cn from 'classnames';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { IMAGE_SIZES } from '../../../../common/constants';
import { StoreState } from '../../../../common/store';
import { playTrack } from '../../../../common/store/player';
import { abbreviate_number, getReadableTime, SC } from '../../../../common/utils';
import { NormalizedResult, SoundCloud } from '../../../../types';
import ActionsDropdown from '../../ActionsDropdown';
import FallbackImage from '../../FallbackImage';
import TextShortener from '../../TextShortener';
import TogglePlayButton from '../../TogglePlayButton';
import { isPlaying } from '../../../../common/store/player/selectors';
import { getTrackEntity } from '../../../../common/store/entities/selectors';
import './TrackListItem.scss';

interface OwnProps {
    idResult: NormalizedResult;
    currentPlaylistId: string;
}

interface PropsFromState {
    track: SoundCloud.Track | null;
    isPlaying: boolean;
}

interface PropsFromDispatch {
    playTrack: typeof playTrack;
}

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class TrackListItem extends React.PureComponent<AllProps> {

    playTrack(doubleClick: boolean, e: React.MouseEvent<any>) {
        const { playTrack, currentPlaylistId, idResult } = this.props;

        if (doubleClick) {
            e.preventDefault();
        }

        playTrack(currentPlaylistId, { id: idResult.id }, true);

    }

    renderToggleButton = () => {
        const { isPlaying } = this.props;

        if (isPlaying) {
            return <TogglePlayButton className='toggleButton' />;
        }

        const icon = isPlaying ? 'pause' : 'play';

        return (

            <a
                href='javascript:void(0)'
                className='toggleButton'
                onClick={(e) => {
                    this.playTrack(true, e);
                }}
            >
                <i className={`bx bx-${icon}`} />
            </a>
        );
    }

    render() {
        const {
            track,
            isPlaying,
        } = this.props;

        if (!track || !track.title) return null;

        return (
            <tr
                className={cn('trackItem', { isPlaying })}
                onDoubleClick={(e) => {
                    this.playTrack(false, e);
                }}
            >
                <td>
                    <div className='img-with-shadow'>
                        <FallbackImage src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)} />
                        <FallbackImage overflow={true} className='shadow' src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)} />
                        {
                            SC.isStreamable(track) ? this.renderToggleButton() : null
                        }
                    </div>
                </td>
                <td>
                    <div className='trackTitle'>
                        <Link to={`/track/${track.id}`}>
                            <TextShortener text={track.title} clamp={1} />
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


const mapStateToProps = (state: StoreState, props: OwnProps): PropsFromState => {
    const { idResult, currentPlaylistId } = props;

    return {
        isPlaying: isPlaying(idResult, currentPlaylistId)(state),
        track: getTrackEntity(idResult.id)(state)
    };
};

const mapDispatchToProps: MapDispatchToProps<PropsFromDispatch, OwnProps> = (dispatch) => bindActionCreators({
    playTrack
}, dispatch);

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(mapStateToProps, mapDispatchToProps)(TrackListItem);
