import { TextShortener } from '@renderer/_shared/TextShortener';
import { SoundCloud } from '@types';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export interface Props {
  track: SoundCloud.Track | SoundCloud.Playlist;
  showReposts: boolean;
}

export const TrackGridItemInfo: FC<Props> = ({ track, showReposts }) => {
  const objectUrl = `${track.kind === 'playlist' ? '/playlist' : '/track'}/${track.id}`;

  return (
    <div className="trackInfo">
      <div className="trackTitle">
        <Link to={objectUrl}>
          <TextShortener text={track.title} />
        </Link>
      </div>
      {track.fromUser && showReposts && track.type?.indexOf('repost') !== -1 ? (
        <div className="trackArtist">
          <Link to={`/user/${track.user.id}`}>{track.user.username}</Link>
          <i className="bx bx-repost" />

          <Link to={`/user/${track.fromUser.id}`} className="repost">
            {track.fromUser.username}
          </Link>
        </div>
      ) : (
        <div className="trackArtist">
          <Link to={`/user/${track.user.id}`}>{track.user.username}</Link>
        </div>
      )}
    </div>
  );
};
