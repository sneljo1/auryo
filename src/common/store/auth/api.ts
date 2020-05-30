import fetchToJsonNew from '@common/api/helpers/fetchToJsonNew';
import { playlistSchema, userSchema } from '@common/schemas';
import { Collection, EntitiesOf, SoundCloud, ResultOf } from '@types';
import { normalize, schema } from 'normalizr';

export async function fetchUserFollowingIds(userId: string | number) {
  return fetchToJsonNew<Collection<number>>({
    uri: `users/${userId}/followings/ids`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: 5000
    }
  });
}

export async function fetchLikeIds(type: 'track' | 'playlist' | 'system_playlist') {
  return fetchToJsonNew<Collection<number>>({
    uri: `me/${type}_likes/${type === 'system_playlist' ? 'urns' : `ids`}`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: 5000
    }
  });
}
export async function fetchRepostIds(type: 'track' | 'playlist') {
  return fetchToJsonNew<Collection<number>>({
    uri: `me/${type}_reposts/ids`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: 200
    }
  });
}

export async function fetchCurrentUser() {
  return fetchToJsonNew<SoundCloud.User>({
    uri: 'me',
    oauthToken: true
  });
}

type FetchPlaylistsResponse = Collection<FetchedPlaylistItem>;

export interface FetchedPlaylistItem {
  playlist: SoundCloud.Playlist;
  created_at: string;
  type: 'playlist' | 'playlist-like';
  user: SoundCloud.User;
  uuid: string;
}

export async function fetchPlaylists() {
  const json = await fetchToJsonNew<FetchPlaylistsResponse>({
    uri: 'me/library/albums_playlists_and_system_playlists',
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: 5000
    }
  });

  const normalized = normalize<
    FetchedPlaylistItem,
    EntitiesOf<FetchedPlaylistItem>,
    ResultOf<FetchedPlaylistItem, 'playlist' | 'user'>
  >(
    json.collection,
    new schema.Array({
      playlist: playlistSchema,
      user: userSchema
    })
  );

  return {
    normalized,
    json
  };
}

// LIKES
export async function toggleTrackLike(options: { trackId: string | number; userId: string | number; like: boolean }) {
  const json = await fetchToJsonNew<Collection<SoundCloud.Track>>(
    {
      uri: `users/${options.userId}/track_likes/${options.trackId}`,
      oauthToken: true,
      useV2Endpoint: true
    },
    { method: options.like ? 'PUT' : 'DELETE' }
  );

  return json;
}

export async function togglePlaylistLike(options: {
  playlistId: string | number;
  userId: string | number;
  like: boolean;
}) {
  const json = await fetchToJsonNew<Collection<SoundCloud.Track>>(
    {
      uri: `users/${options.userId}/playlist_likes/${options.playlistId}`,
      oauthToken: true,
      useV2Endpoint: true
    },
    { method: options.like ? 'PUT' : 'DELETE' }
  );

  return json;
}

export async function toggleSystemPlaylistLike(options: {
  playlistUrn: string;
  userId: string | number;
  like: boolean;
}) {
  const json = await fetchToJsonNew<Collection<SoundCloud.Track>>(
    {
      uri: `users/${options.userId}/system_playlist_likes/${options.playlistUrn}`,
      oauthToken: true,
      useV2Endpoint: true
    },
    { method: options.like ? 'PUT' : 'DELETE' }
  );

  return json;
}

// REPOSTS

export async function toggleTrackRepost(options: { trackId: string | number; repost: boolean }) {
  const json = await fetchToJsonNew<Collection<SoundCloud.Track>>(
    {
      uri: `me/track_reposts/${options.trackId}`,
      oauthToken: true,
      useV2Endpoint: true
    },
    { method: options.repost ? 'PUT' : 'DELETE' }
  );

  return json;
}

export async function togglePlaylistRepost(options: { playlistId: string | number; repost: boolean }) {
  const json = await fetchToJsonNew<Collection<SoundCloud.Track>>(
    {
      uri: `me/playlist_reposts/${options.playlistId}`,
      oauthToken: true,
      useV2Endpoint: true
    },
    { method: options.repost ? 'PUT' : 'DELETE' }
  );

  return json;
}

// Following
export async function toggleFollowing(options: { userId: string | number; follow: boolean }) {
  const json = await fetchToJsonNew<Collection<SoundCloud.Track>>(
    {
      uri: `me/followings/${options.userId}`,
      oauthToken: true,
      useV2Endpoint: true
    },
    { method: options.follow ? 'POST' : 'DELETE' }
  );

  return json;
}
