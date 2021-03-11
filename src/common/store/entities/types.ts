import { Normalized, SoundCloud } from '@types';

export type EntitiesState = {
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
  userProfileEntities: {
    [userUrn: string]: SoundCloud.UserProfiles;
  };
};
