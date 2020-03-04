import { IMAGE_SIZES } from '@common/constants';
import { StoreState } from '@common/store';
import * as actions from '@common/store/actions';
import { getMusicEntity } from '@common/store/entities/selectors';
import { isPlaying } from '@common/store/player/selectors';
import { abbreviateNumber, SC } from '@common/utils';
import { getReadableTime } from '@common/utils/appUtils';
import cn from 'classnames';
import { autobind } from 'core-decorators';
import React from 'react';
import isDeepEqual from 'react-fast-compare';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import { Normalized, SoundCloud } from '../../../../types';
import ActionsDropdown from '../../ActionsDropdown';
import FallbackImage from '../../FallbackImage';
import { TextShortener } from '../../TextShortener';
import TogglePlayButton from '../../TogglePlayButton';
import './TrackGridItem.scss';
import { PlayingTrack } from '@common/store/player';

const mapStateToProps = (state: StoreState, props: OwnProps) => {
  const { idResult, currentPlaylistId } = props;

  return {
    isTrackPlaying: isPlaying(idResult, currentPlaylistId)(state),
    track: getMusicEntity<SoundCloud.Playlist | SoundCloud.Track>(idResult)(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      playTrack: actions.playTrack,
      fetchPlaylistIfNeeded: actions.fetchPlaylistIfNeeded
    },
    dispatch
  );

interface OwnProps {
  idResult: Normalized.NormalizedResult;
  currentPlaylistId: string;
  showInfo?: boolean;
  showReposts: boolean;
  skipFetch?: boolean;
}

type PropsFromState = ReturnType<typeof mapStateToProps>;

type PropsFromDispatch = ReturnType<typeof mapDispatchToProps>;

type AllProps = OwnProps & PropsFromState & PropsFromDispatch;

@autobind
class TrackGridItem extends React.Component<AllProps> {
  public static defaultProps: Partial<AllProps> = {
    showInfo: false
  };

  public componentDidMount() {
    const { track, fetchPlaylistIfNeeded, skipFetch } = this.props;

    if (track && track.kind === 'playlist' && track.track_count && !track.tracks && !skipFetch) {
      fetchPlaylistIfNeeded(track.id);
    }
  }

  public shouldComponentUpdate(nextProps: AllProps) {
    if (!isDeepEqual(nextProps, this.props)) {
      return true;
    }

    return false;
  }

  public componentDidUpdate(prevProps: AllProps) {
    const { track, fetchPlaylistIfNeeded, skipFetch } = this.props;

    if (
      (prevProps.track === null && track != null) ||
      (prevProps.track && track && prevProps.track.id !== track.id && !skipFetch)
    ) {
      if (track.kind === 'playlist' && track.track_count && !track.tracks) {
        fetchPlaylistIfNeeded(track.id);
      }
    }
  }

  public renderArtist() {
    const { track, showReposts } = this.props;

    if (!track || !track.user) {
      return null;
    }

    if (track.from_user && showReposts && track.type?.indexOf('repost') !== -1) {
      return (
        <div className="trackArtist">
          <Link to={`/user/${track.user.id}`}>{track.user.username}</Link>
          <i className="bx bx-repost" />

          <Link to={`/user/${track.from_user.id}`} className="repost">
            {track.from_user.username}
          </Link>
        </div>
      );
    }

    return (
      <div className="trackArtist">
        <Link to={`/user/${track.user.id}`}>{track.user.username}</Link>
      </div>
    );
  }

  public renderToggleButton() {
    const { isTrackPlaying, playTrack, currentPlaylistId, track } = this.props;

    if (!track) {
      return null;
    }

    if (isTrackPlaying) {
      return <TogglePlayButton className="toggleButton minimal" />;
    }

    const icon = isTrackPlaying ? 'pause' : 'play';

    let next: Partial<PlayingTrack> = { id: track.id };

    if (track.kind === 'playlist') {
      next = { playlistId: track.id.toString() };
    }

    return (
      <a
        href="javascript:void(0)"
        className="toggleButton minimal"
        onClick={() => {
          playTrack(currentPlaylistId, next as PlayingTrack, true);
        }}>
        <i className={`bx bx-${icon}`} />
      </a>
    );
  }

  public renderStats() {
    const { track, showInfo, currentPlaylistId } = this.props;

    if (!track || !track.user) {
      return null;
    }

    const isLiked = track.type && track.type.indexOf('like') !== -1;

    return (
      <div className="trackFooter d-flex justify-content-between align-items-center">
        <div className="trackStats">
          {showInfo ? (
            <>
              <div className="stat">
                <i className="bx bxs-heart" />
                <span>{abbreviateNumber(track.likes_count)}</span>
              </div>
              <div className="stat">
                <i className="bx bx-repost" />
                <span>{abbreviateNumber(track.reposts_count)}</span>
              </div>
            </>
          ) : null}
          {isLiked && (
            <>
              <span className="stat">
                <i className="bx bxs-heart text-danger" /> Liked
              </span>
            </>
          )}

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
          <ActionsDropdown track={track} currentPlaylistId={currentPlaylistId} />

          <div className="trackTime">
            <i className="bx bx-alarm" />
            <span>{getReadableTime(track.duration, true, true)}</span>
          </div>
        </div>
      </div>
    );
  }

  public renderInfo() {
    const { track } = this.props;

    if (!track) {
      return null;
    }

    const objectUrl = `${track.kind === 'playlist' ? '/playlist' : '/track'}/${track.id}`;

    return (
      <div className="trackInfo">
        <div className="trackTitle">
          <Link to={objectUrl}>
            <TextShortener text={track.title} />
          </Link>
        </div>
        {this.renderArtist()}
      </div>
    );
  }

  public render() {
    const { isTrackPlaying, track } = this.props;

    const image = SC.getImageUrl(track, IMAGE_SIZES.LARGE);

    if (!track || !track.user) {
      return null;
    }

    return (
      <div
        className={cn('trackWrapper', {
          playlist: track.kind === 'playlist'
        })}>
        <div
          className={cn('track-grid-item', track.id, {
            isPlaying: isTrackPlaying,
            playlist: track.kind === 'playlist'
          })}>
          <div className="trackImage">
            <div className="imageWrapper">
              {track.kind === 'playlist' ? (
                <div className="trackCount d-flex align-items-center justify-content-center flex-column">
                  <span>{track.track_count}</span> <span>tracks</span>
                </div>
              ) : null}
              <FallbackImage src={image} />
              {SC.isStreamable(track) || track.kind === 'playlist' ? this.renderToggleButton() : null}
            </div>

            {this.renderStats()}
            {track.genre && track.genre !== '' ? (
              <Link to={`/tags/${track.genre}`} className="trackGenre">
                {track.genre}
              </Link>
            ) : null}
          </div>

          {this.renderInfo()}
        </div>
      </div>
    );
  }
}

export default connect<PropsFromState, PropsFromDispatch, OwnProps, StoreState>(
  mapStateToProps,
  mapDispatchToProps
)(TrackGridItem);
