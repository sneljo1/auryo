import { IMAGE_SIZES } from '@common/constants';
import * as actions from '@common/store/actions';
import { getTrackEntity, isPlayingSelector } from '@common/store/selectors';
import { abbreviateNumber, getReadableTime, SC } from '@common/utils';
import cn from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import { Normalized } from '../../../../types';
import { ActionsDropdown } from '../../ActionsDropdown';
import FallbackImage from '../../FallbackImage';
import { TogglePlayButton } from '../../PageHeader/components/TogglePlayButton';
import { TextShortener } from '../../TextShortener';
import './TrackListItem.scss';
import { StoreState } from 'AppReduxTypes';
import { PlaylistIdentifier } from '@common/store/types';

interface OwnProps {
  idResult: Normalized.NormalizedResult;
  playlistId: PlaylistIdentifier;
}

const mapStateToProps = (state: StoreState, props: OwnProps) => {
  const { idResult, playlistId } = props;

  return {
    isTrackPlaying: isPlayingSelector(idResult, playlistId.objectId || '')(state),
    track: getTrackEntity(idResult.id)(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      playTrack: actions.playTrackO
    },
    dispatch
  );

type PropsFromState = ReturnType<typeof mapStateToProps>;
type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

class TrackListItem extends React.PureComponent<AllProps> {
  public playTrack(doubleClick: boolean, e: React.MouseEvent<any>) {
    const { playTrack, currentPlaylistId, idResult } = this.props;

    if (doubleClick) {
      e.preventDefault();
    }

    playTrack(currentPlaylistId, { id: idResult.id }, true);
  }

  public renderToggleButton = () => {
    const { isTrackPlaying, idResult } = this.props;

    if (isTrackPlaying) {
      return <TogglePlayButton idResult={idResult} className="toggleButton" />;
    }

    const icon = isTrackPlaying ? 'pause' : 'play';

    return (
      <a
        href="javascript:void(0)"
        className="toggleButton"
        onClick={e => {
          this.playTrack(true, e);
        }}>
        <i className={`bx bx-${icon}`} />
      </a>
    );
  };

  public render() {
    const { track, isTrackPlaying } = this.props;

    if (!track || !track.title) {
      return null;
    }

    return (
      <tr
        className={cn('trackItem', { isPlaying: isTrackPlaying })}
        onDoubleClick={e => {
          this.playTrack(false, e);
        }}>
        <td>
          <div className="img-with-shadow">
            <FallbackImage src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)} />
            <FallbackImage overflow className="shadow" src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)} />
            {SC.isStreamable(track) ? this.renderToggleButton() : null}
          </div>
        </td>
        <td>
          <div className="trackTitle">
            <Link to={`/track/${track.id}`}>
              <TextShortener text={track.title} clamp={1} />
            </Link>
          </div>
          <div className="stats d-flex align-items-center">
            <i className="bx bxs-heart" />

            <span>{abbreviateNumber(track.likes_count)}</span>

            <i className="bx bx-repost" />
            <span>{abbreviateNumber(track.reposts_count)}</span>
          </div>
        </td>

        <td className="trackArtist">
          <Link to={`/user/${track.user_id}`}>{track.user.username}</Link>
        </td>
        <td className="time">{getReadableTime(track.duration, true, true)}</td>
        <td className="trackitemActions">
          <ActionsDropdown trackOrPlaylist={track} />
        </td>
      </tr>
    );
  }
}

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(
  mapStateToProps,
  mapDispatchToProps
)(TrackListItem);
