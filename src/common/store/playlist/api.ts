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

export async function fetchStream(options: { limit?: number }) {
  const json = await fetchToJsonNew<Collection<FeedItem>>({
    uri: 'stream',
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20
    }
  });

  return json;
}

// Likes
export interface LikeItem {
  kind: 'like';
  track: SoundCloud.Track;
  created_at: string;
}

export async function fetchLikes(options: { userId?: string | number; limit?: number }) {
  const json = await fetchToJsonNew<Collection<LikeItem>>({
    uri: `users/${options.userId}/track_likes`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20
    }
  });

  return json;
}

// My Playlists
export interface PlaylistItem {
  type: 'playlist-like' | 'playlist';
  playlist: SoundCloud.Playlist;
  user: SoundCloud.User;
  created_at: string;
  uuid: string;
}

export async function fetchPlaylists(options: { limit?: number }) {
  const json = await fetchToJsonNew<Collection<PlaylistItem>>({
    uri: `me/library/albums_playlists_and_system_playlists`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20
    }
  });

  return json;
}

// My tracks
export async function fetchMyTracks(options: { userId?: string | number; limit?: number }) {
  const json = await fetchToJsonNew<Collection<SoundCloud.Track>>({
    uri: `users/${options.userId}/tracks`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20
    }
  });

  return json;
}

// Charts
export interface ChartItem {
  score: number;
  track: SoundCloud.Track;
}

export async function fetchCharts(options: { limit?: number; sort?: SortTypes; genre: string }) {
  const json = await fetchToJsonNew<Collection<ChartItem>>({
    uri: `charts`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      kind: options.sort || SortTypes.TOP,
      genre: options.genre
    }
  });

  return json;
}

// Fetch playlist
export async function fetchPlaylist(options: { limit?: number; playlistId: number | string }) {
  const json = await fetchToJsonNew<SoundCloud.Playlist>({
    uri: `playlists/${options.playlistId}`,
    oauthToken: true,
    useV2Endpoint: true
  });

  return json;
}

// Fetch seperate tracks
export async function fetchTracks(options: { ids: number[] }) {
  const json = await fetchToJsonNew<SoundCloud.Track[]>({
    uri: `tracks`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      ids: options.ids.join(',')
    }
  });

  return json;
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
export async function searchAll(options: {
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

  const json = await fetchToJsonNew<SearchAllResponse>({
    uri: `search${options.type ? `/${options.type}` : ''}`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams
  });

  return json;
}

export async function fetchPlaylistsByTag(options: { limit?: number; tag: string }) {
  const json = await fetchToJsonNew<Collection<SoundCloud.Playlist>>({
    uri: `playlists/discovery`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: options.limit ?? 20,
      tag: options.tag
    }
  });

  return json;
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

export async function fetchPersonalizedPlaylists() {
  const json = await fetchToJsonNew<Collection<PersonalisedCollectionItem>>({
    uri: `mixed-selections`,
    oauthToken: true,
    useV2Endpoint: true
  });

  return json;
}
