import { IMAGE_SIZES } from '@common/constants';
import { getMusicEntity, isPlayingSelector } from '@common/store/selectors';
import { PlaylistIdentifier } from '@common/store/types';
import { abbreviateNumber, SC } from '@common/utils';
import { getReadableTime } from '@common/utils/appUtils';
import cn from 'classnames';
import React, { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Normalized, SoundCloud } from '../../../../types';
import { ActionsDropdown } from '../../ActionsDropdown';
import FallbackImage from '../../FallbackImage';
import { TogglePlayButton } from '../../PageHeader/components/TogglePlayButton';
import './TrackGridItem.scss';
import { TrackGridItemInfo } from './TrackGridItemInfo';

interface Props {
  idResult: Normalized.NormalizedResult;
  playlistID: PlaylistIdentifier;
  showInfo?: boolean;
  showReposts: boolean;
  skipFetch?: boolean;
}

// TODO: onHover fetch Tracks if it is a playlist?
export const TrackGridItem: FC<Props> = ({ idResult, playlistID, showReposts, showInfo }) => {
  const isTrackPlaying = useSelector(isPlayingSelector(playlistID, idResult));
  const track = useSelector(getMusicEntity<SoundCloud.Playlist | SoundCloud.Track>(idResult));

  const Stats = useMemo(() => {
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
          <ActionsDropdown trackOrPlaylist={track} playlistID={playlistID} />

          <div className="trackTime">
            <i className="bx bx-alarm" />
            <span>{getReadableTime(track.duration, true, true)}</span>
          </div>
        </div>
      </div>
    );
  }, [playlistID, showInfo, track]);

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
            {SC.isStreamable(track) || track.kind === 'playlist' ? (
              <div className="playButtonWrapper">
                <TogglePlayButton large idResult={idResult} playlistID={playlistID} className="playButton" />
              </div>
            ) : null}
          </div>

          {Stats}
          {track.genre && track.genre !== '' ? (
            <Link to={`/tags/${track.genre}`} className="trackGenre">
              {track.genre}
            </Link>
          ) : null}
        </div>

        <TrackGridItemInfo track={track} showReposts={showReposts} />
      </div>
    </div>
  );
};
