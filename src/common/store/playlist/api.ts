import fetchToJsonNew from '@common/api/helpers/fetchToJsonNew';
import { Collection, SoundCloud } from '@types';
import { SortTypes } from './types';

// Stream
export interface FeedItem {
  type: 'playlist' | 'track' | 'track-repost' | 'playlist-repost';
  playlist?: SoundCloud.Playlist;
  track?: SoundCloud.Track;
  user: SoundCloud.CompactUser;
}

// TODO: Unable to migrate to public API because repost user is not available on the API
export function fetchStream(options: { limit?: number }) {
  return fetchToJsonNew<Collection<FeedItem>>({
    uri: 'stream',
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20
    }
  });
}

// Likes
export function fetchMyLikes(options: { limit?: number }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `me/likes/tracks`,
    oauthToken: true,
    queryParams: {
      linked_partitioning: true,
      limit: options.limit ?? 20
    }
  });
}

export function fetchUserLikes(options: { userId: string | number; limit?: number }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `users/${options.userId}/likes/tracks`,
    oauthToken: true,
    queryParams: {
      linked_partitioning: true,
      limit: options.limit ?? 20
    }
  });
}

// My Playlists
export interface PlaylistItem {
  type: 'playlist-like' | 'playlist';
  playlist: SoundCloud.Playlist;
  user: SoundCloud.User;
  created_at: string;
  uuid: string;
}

// TODO: Unable to migrate to public API because liked playlists does not exist
export function fetchPlaylists(options: { limit?: number }) {
  return fetchToJsonNew<Collection<PlaylistItem>>({
    uri: `me/library/albums_playlists_and_system_playlists`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20
    }
  });
}

// My tracks
export function fetchMyTracks(options: { limit?: number }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `me/tracks`,
    oauthToken: true,
    queryParams: {
      linked_partitioning: true,
      limit: options.limit ?? 20
    }
  });
}

// Charts
export interface ChartItem {
  score: number;
  track: SoundCloud.Track;
}

// TODO: Unable to migrate to public API because this does not exist yet onthere
export function fetchCharts(options: { limit?: number; sort?: SortTypes; genre: string }) {
  return fetchToJsonNew<Collection<ChartItem>>({
    uri: `charts`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      kind: options.sort || SortTypes.TOP,
      genre: options.genre
    }
  });
}

// Fetch playlist
export function fetchPlaylist(options: { limit?: number; playlistId: number | string }) {
  return fetchToJsonNew<SoundCloud.Playlist>({
    uri: `playlists/${options.playlistId}`,
    oauthToken: true
    // useV2Endpoint: true
  });
}

// Fetch seperate tracks
export function fetchTracks(options: { ids: number[] }) {
  return fetchToJsonNew<SoundCloud.Track[]>({
    uri: `tracks`,
    oauthToken: true,
    queryParams: {
      ids: options.ids.join(',')
    }
  });
}

interface SearchAllResponse {
  collection: SearchCollectionItem[];
  next_href?: string;
  query_urn: string;
  total_results: number;
  facets: { value: 'sound' | 'set' | 'person'; count: number; filter: string }[];
}

export type SearchCollectionItem = SoundCloud.Track | SoundCloud.Playlist | SoundCloud.User;

// SearchByQuery
export function searchAll(options: {
  query?: string;
  limit: number;
  type?: 'users' | 'playlists_without_albums' | 'tracks';
  genre?: string;
}) {
  const queryParams = {
    q: options.query || '',
    limit: options.limit || 20
    // facet: 'model'
  };

  if (options.genre) {
    queryParams['filter.genre'] = options.genre;
  }

  return fetchToJsonNew<SearchAllResponse>({
    uri: `search${options.type ? `/${options.type}` : ''}`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams
  });
}

export interface PersonalisedCollectionItem {
  urn: string;
  last_updated: string;
  kind: 'selection';
  query_urn: string;
  social_proof: SoundCloud.CompactUser | null;
  social_proof_users: any | null;
  description: string;
  style: string | null;
  id: string;
  title: string;
  tracking_feature_name: string;
  items: Collection<SoundCloud.SystemPlaylist>;
}

export function fetchPersonalizedPlaylists() {
  return fetchToJsonNew<Collection<PersonalisedCollectionItem>>({
    uri: `mixed-selections`,
    oauthToken: true,
    useV2Endpoint: true
  });
}
