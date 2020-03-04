import * as SoundCloud from './soundcloud';

export interface Playlist extends Omit<SoundCloud.Playlist, 'tracks' | 'user'> {
  tracks: NormalizedResult[];
  user: number;
}

export interface Track extends Omit<SoundCloud.Track, 'user'> {
  user: number;
}

export interface NormalizedResult {
  schema: 'users' | 'tracks' | 'playlists' | 'comments';
  id: number;
}

export interface NormalizedPersonalizedItem {
  urn: string;
  query_urn?: string;
  title: string;
  description: string;
  tracking_feature_name: string;
  last_updated: string;
  style: string;
  social_proof: SoundCloud.CompactUser;
  items: {
    collection: string[];
    next_href: string | null;
    query_urn: string | null;
  };
}

export interface NormalizedResponse {
  entities: NormalizedEntities;
  result: NormalizedResult[];
}

export interface NormalizedEntities {
  playlistEntities?: {
    [playlistId: string]: Playlist;
  };
  trackEntities?: {
    [trackId: string]: Track;
  };
  userEntities?: {
    [trackId: string]: SoundCloud.User;
  };
  commentEntities?: {
    [commentId: string]: SoundCloud.Comment;
  };
}
