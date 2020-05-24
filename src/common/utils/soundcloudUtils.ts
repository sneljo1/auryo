import { CONFIG } from '../../config';
import { IMAGE_SIZES } from '../constants';

const endpoint = 'https://api.soundcloud.com/';
const v2Endpoint = 'https://api-v2.soundcloud.com/';
let memToken: string;

export function initialize(token: string) {
  memToken = token;
}

function makeUrl(uri: string, opts: any, v2 = false) {
  const options = opts;
  if (options.client_id) {
    if (typeof options.client_id === 'string') {
      // eslint-disable-next-line no-self-assign
      options.client_id = options.client_id;
    } else {
      options.client_id = CONFIG.CLIENT_ID;
    }
  }
  if (options.oauth_token) {
    options.oauth_token = memToken;
  }

  let url = endpoint;

  if (v2) {
    url = v2Endpoint;
  }

  // add uri
  url += uri;

  // Add query params
  url += `?${Object.keys(options)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(options[k])}`)
    .join('&')}`;

  return url;
}

export function getTrackUrl(trackId: string | number) {
  return makeUrl(
    `tracks/${trackId}`,
    {
      client_id: true
    },
    true
  );
}

export function getChartsUrl(genre: string, sort = 'top', limit = 50) {
  return makeUrl(
    'charts',
    {
      client_id: true,
      kind: sort,
      genre: `soundcloud:genres:${genre}`,
      limit
    },
    true
  );
}

export function getRemainingTracks(overrideClientId?: string) {
  return makeUrl('rate_limit_status', {
    client_id: overrideClientId || true
  });
}
export function registerPlayUrl() {
  return makeUrl(
    'me/play-history',
    {
      oauth_token: true
    },
    true
  );
}

export function getUserUrl(artistID: string | number) {
  return makeUrl(`users/${artistID}`, {
    client_id: true
  });
}

export function getUserTracksUrl(artistID: string | number, limit = 50) {
  return makeUrl(`users/${artistID}/tracks`, {
    client_id: true,
    linked_partitioning: 1,
    limit
  });
}
export function getPersonalizedurl() {
  return makeUrl(
    `mixed-selections`,
    {
      oauth_token: true
    },
    true
  );
}

export function getUserWebProfilesUrl(artistID: number) {
  return makeUrl(`users/${artistID}/web-profiles`, {
    client_id: true
  });
}

export function getUserLikesUrl(artistID: string | number, limit = 50) {
  return makeUrl(`users/${artistID}/favorites`, {
    client_id: true,
    linked_partitioning: 1,
    limit
  });
}

export function getAllUserPlaylistsUrl(artistID: string | number, limit = 50) {
  return makeUrl(
    `users/${artistID}/playlists/liked_and_owned`,
    {
      oauth_token: true,
      linked_partitioning: 1,
      limit
    },
    true
  );
}

export function getLikesUrl(limit = 50) {
  return makeUrl('me/favorites', {
    oauth_token: true,
    linked_partitioning: 1,
    limit
  });
}

export function getLikeIdsUrl(limit = 5000) {
  return makeUrl('me/favorites/ids', {
    oauth_token: true,
    linked_partitioning: 1,
    limit
  });
}

export function getPlaylistLikeIdsUrl(limit = 5000) {
  return makeUrl(
    'me/playlist_likes/ids',
    {
      oauth_token: true,
      linked_partitioning: 1,
      limit
    },
    true
  );
}

export function getFeedUrl(limit = 15) {
  return makeUrl(
    'stream',
    {
      linked_partitioning: 1,
      limit,
      oauth_token: true
    },
    true
  );
}

export function getPlaylistUrl() {
  return makeUrl('me/playlists', {
    oauth_token: true
  });
}

export function getPlaylistupdateUrl(playlistId: string | number) {
  return makeUrl(
    `playlists/${playlistId}`,
    {
      oauth_token: true
    },
    true
  );
}

export function getTracks(ids: number[]) {
  return makeUrl(
    'tracks',
    {
      ids: ids.join(','),
      oauth_token: true
    },
    true
  );
}

export function getPlaylistDeleteUrl(playlistId: string | number) {
  return makeUrl(`playlists/${playlistId}`, {
    oauth_token: true
  });
}

export function getPlaylistTracksUrl(playlistId: string | number) {
  return makeUrl(
    `playlists/${playlistId}`,
    {
      oauth_token: true
    },
    true
  );
}

export function getRelatedUrl(trackId: string | number, limit = 50) {
  return makeUrl(`tracks/${trackId}/related`, {
    client_id: true,
    linked_partitioning: 1,
    limit
  });
}

export function getCommentsUrl(trackId: string | number, limit = 20) {
  return makeUrl(`tracks/${trackId}/comments`, {
    client_id: true,
    linked_partitioning: 1,
    limit
  });
}

export function getMeUrl() {
  return makeUrl('me', {
    oauth_token: true
  });
}

export function getFollowingsUrl(userId: string) {
  return makeUrl(
    `users/${userId}/followings/ids`,
    {
      oauth_token: true,
      limit: 5000,
      linked_partitioning: 1
    },
    true
  );
}

export function getRepostIdsUrl(playlist?: boolean) {
  return makeUrl(
    `me/${playlist ? 'playlist' : 'track'}_reposts/ids`,
    {
      oauth_token: true,
      limit: 200,
      linked_partitioning: 1
    },
    true
  );
}

export function updateLikeUrl(trackId: string | number) {
  return makeUrl(`me/favorites/${trackId}`, {
    oauth_token: true
  });
}

export function updatePlaylistLikeUrl(userID: string | number, playlistID: string | number) {
  return makeUrl(
    `users/${userID}/playlist_likes/${playlistID}`,
    {
      oauth_token: true
    },
    true
  );
}

export function updateFollowingUrl(userID: string | number) {
  return makeUrl(`me/followings/${userID}`, {
    oauth_token: true
  });
}

export function updateRepostUrl(trackId: string | number, playlist: boolean) {
  return makeUrl(`e1/me/${playlist ? 'playlist' : 'track'}_reposts/${trackId}`, {
    oauth_token: true
  });
}

export function searchAllUrl(query: string, limit = 20, offset = 0) {
  return makeUrl(
    'search',
    {
      oauth_token: true,
      q: query,
      limit,
      offset,
      linked_partitioning: 1,
      facet: 'model'
    },
    true
  );
}

export function searchTracksUrl(query: string, limit = 15, offset = 0) {
  return makeUrl('tracks', {
    oauth_token: true,
    q: query,
    limit,
    offset,
    linked_partitioning: 1
  });
}

export function searchTagurl(genre: string, limit = 15, offset = 0) {
  return makeUrl(
    'search/tracks',
    {
      oauth_token: true,
      q: '',
      'filter.genre': genre,
      limit,
      offset,
      linked_partitioning: 1
    },
    true
  );
}

export function discoverPlaylistsUrl(tag: string, limit = 15, offset = 0) {
  return makeUrl(
    'playlists/discovery',
    {
      oauth_token: true,
      tag,
      limit,
      offset,
      linked_partitioning: 1
    },
    true
  );
}

export function searchUsersUrl(query: string, limit = 15, offset = 0) {
  return makeUrl('users', {
    oauth_token: true,
    q: query,
    limit,
    offset,
    linked_partitioning: 1
  });
}

export function searchPlaylistsUrl(query: string, limit = 15, offset = 0) {
  return makeUrl(
    'search/playlists',
    {
      oauth_token: true,
      q: query,
      limit,
      offset,
      linked_partitioning: 1
    },
    true
  );
}

export function resolveUrl(url: string) {
  return `${endpoint}resolve?client_id=${CONFIG.CLIENT_ID}&url=${url}`;
}

export function appendToken(url: string) {
  return `${url}&oauth_token=${memToken}`;
}

export function appendJustToken(url: string) {
  return `${url}?oauth_token=${memToken}`;
}

export function appendClientId(url: string, overrideClientId?: string | null) {
  return `${url}?client_id=${overrideClientId || CONFIG.CLIENT_ID}`;
}

export function getImageUrl(track: any, size: string) {
  let imageUrl = '';
  if (typeof track === 'object') {
    imageUrl = track.artwork_url;

    if ((!track.artwork_url || track.artwork_url == null) && track.user) {
      imageUrl = track.user.avatar_url;
    }
  } else {
    imageUrl = track;
  }

  if (!imageUrl) {
    return '';
  }

  if (imageUrl.indexOf('default_avatar') > -1) {
    return imageUrl;
  }

  imageUrl = imageUrl.replace('http:', '');

  switch (size) {
    case IMAGE_SIZES.LARGE:
      return imageUrl.replace('large', IMAGE_SIZES.LARGE);
    case IMAGE_SIZES.XLARGE:
      return imageUrl.replace('large', IMAGE_SIZES.XLARGE);
    case IMAGE_SIZES.MEDIUM:
      return imageUrl.replace('large', IMAGE_SIZES.MEDIUM);
    case IMAGE_SIZES.XSMALL:
      return imageUrl.replace('large', IMAGE_SIZES.XSMALL);
    case IMAGE_SIZES.SMALL:
      return imageUrl;
    default:
  }

  return imageUrl;
}

/*
 * Util functions
 */

export function hasID(id: any, object: any) {
  return object && object[id] && object[id] === true;
}

export function isStreamable(track: any) {
  return track.streamable === true;
}
