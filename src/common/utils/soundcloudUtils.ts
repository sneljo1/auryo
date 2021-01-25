import { CONFIG } from '../../config';
import { IMAGE_SIZES } from '../constants';

const endpoint = 'https://api.soundcloud.com/';
const v2Endpoint = 'https://api-v2.soundcloud.com/';

// eslint-disable-next-line import/no-mutable-exports
export let memToken: string;

export function initialize(token: string) {
  console.log('initialize token');
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

export function getRemainingTracks(g) {
  return makeUrl('rate_limit_status', {
    client_id: true
  });
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

export function appendClientId(url: string) {
  return `${url}?client_id=${CONFIG.CLIENT_ID}`;
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
  return object?.[id] === true;
}

export function isStreamable(track: any) {
  return track.streamable === true;
}
