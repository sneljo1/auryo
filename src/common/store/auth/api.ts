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
