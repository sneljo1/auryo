import { Normalized, SoundCloud } from '@types';

export type EntitiesState = Readonly<{
  playlistEntities: {
    [playlistId: number]: Normalized.Playlist;
  };
  trackEntities: {
    [trackId: number]: Normalized.Track;
  };
  userEntities: {
    [userId: number]: SoundCloud.User;
  };
  commentEntities: {
    [commentId: number]: SoundCloud.Comment;
  };
}>;
