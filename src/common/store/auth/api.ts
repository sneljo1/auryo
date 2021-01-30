import fetchToJsonNew from '@common/api/helpers/fetchToJsonNew';
import { playlistSchema, userSchema } from '@common/schemas';
import { Collection, EntitiesOf, ResultOf, SoundCloud } from '@types';
import { normalize, schema } from 'normalizr';
import { map } from 'rxjs/operators';

export function fetchUserFollowingIds(userId: string | number) {
  return fetchToJsonNew<Collection<number>>({
    uri: `users/${userId}/followings/ids`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: 5000
    }
  });
}

export function fetchLikeIds(type: 'track' | 'playlist' | 'system_playlist') {
  return fetchToJsonNew<Collection<number>>({
    uri: `me/${type}_likes/${type === 'system_playlist' ? 'urns' : `ids`}`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: 5000
    }
  });
}
export function fetchRepostIds(type: 'track' | 'playlist') {
  return fetchToJsonNew<Collection<number>>({
    uri: `me/${type}_reposts/ids`,
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: 200
    }
  });
}

export function fetchCurrentUser() {
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

export function fetchPlaylists() {
  const json$ = fetchToJsonNew<FetchPlaylistsResponse>({
    uri: 'me/library/albums_playlists_and_system_playlists',
    oauthToken: true,
    useV2Endpoint: true,
    queryParams: {
      limit: 5000
    }
  });

  return json$.pipe(
    map((json) => {
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
    })
  );
}

// LIKES
export function toggleTrackLike(options: { trackId: string | number; like: boolean }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>(
    {
      uri: `likes/tracks/${options.trackId}`,
      oauthToken: true
    },
    { method: options.like ? 'PUT' : 'DELETE' }
  );
}

export function togglePlaylistLike(options: { playlistId: string | number; like: boolean }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>(
    {
      uri: `likes/playlists/{playlist_id}/${options.playlistId}`,
      oauthToken: true
    },
    { method: options.like ? 'PUT' : 'DELETE' }
  );
}

export function toggleSystemPlaylistLike(options: { playlistUrn: string; userId: string | number; like: boolean }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>(
    {
      uri: `users/${options.userId}/system_playlist_likes/${options.playlistUrn}`,
      oauthToken: true,
      useV2Endpoint: true
    },
    { method: options.like ? 'PUT' : 'DELETE' }
  );
}

// REPOSTS

export function toggleTrackRepost(options: { trackId: string | number; repost: boolean }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>(
    {
      uri: `reposts/tracks/${options.trackId}`,
      oauthToken: true
    },
    { method: options.repost ? 'PUT' : 'DELETE' }
  );
}

export function togglePlaylistRepost(options: { playlistId: string | number; repost: boolean }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>(
    {
      uri: `reposts/playlists/${options.playlistId}`,
      oauthToken: true
    },
    { method: options.repost ? 'PUT' : 'DELETE' }
  );
}

// Following
export async function toggleFollowing(options: { userId: string | number; follow: boolean }) {
  return fetchToJsonNew<Collection<SoundCloud.Track>>(
    {
      uri: `/me/followings//${options.userId}`,
      oauthToken: true
    },
    { method: options.follow ? 'PUT' : 'DELETE' }
  );
}
