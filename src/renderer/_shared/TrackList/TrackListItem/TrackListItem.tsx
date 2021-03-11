import { IMAGE_SIZES } from '@common/constants';
import { startPlayMusic } from '@common/store/actions';
import { getMusicEntity, isPlayingSelector } from '@common/store/selectors';
import { PlaylistIdentifier } from '@common/store/types';
import { abbreviateNumber, getReadableTime, SC } from '@common/utils';
import cn from 'classnames';
import { stopForwarding } from 'electron-redux';
import React, { FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Normalized, SoundCloud } from '../../../../types';
import { ActionsDropdown } from '../../ActionsDropdown';
import FallbackImage from '../../FallbackImage';
import { TogglePlayButton } from '../../PageHeader/components/TogglePlayButton';
import { TextShortener } from '../../TextShortener';
import './TrackListItem.scss';

interface Props {
  idResult: Normalized.NormalizedResult;
  playlistID: PlaylistIdentifier;
}

export const TrackListItem: FC<Props> = ({ playlistID, idResult }) => {
  const isTrackPlaying = useSelector(isPlayingSelector(playlistID, idResult));
  const track = useSelector(getMusicEntity<SoundCloud.Track>(idResult));
  const dispatch = useDispatch();

  const playTrack = useCallback(() => {
    dispatch(stopForwarding(startPlayMusic({ idResult, origin: playlistID })));
  }, [dispatch, idResult, playlistID]);

  if (!track || !track.title) {
    return null;
  }

  return (
    <tr className={cn('trackItem', { isPlaying: isTrackPlaying })} onDoubleClick={() => playTrack()}>
      <td>
        <div className="img-with-shadow">
          <FallbackImage src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)} />
          <FallbackImage overflow className="shadow" src={SC.getImageUrl(track, IMAGE_SIZES.XSMALL)} />
          {SC.isStreamable(track) ? (
            <TogglePlayButton large idResult={idResult} playlistID={playlistID} className="toggleButton" />
          ) : null}
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
      <td className="time">{getReadableTime(track.duration / 1000)}</td>
      <td className="trackitemActions">
        <ActionsDropdown trackOrPlaylist={track} />
      </td>
    </tr>
  );
};
