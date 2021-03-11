import { CONFIG } from '../../config';
import { IMAGE_SIZES } from '../constants';

// eslint-disable-next-line import/no-mutable-exports
export let memToken: string;

if (typeof window !== 'undefined') {
  // eslint-disable-next-line func-names
  (window as any).changeToken = function (token: string) {
    memToken = token;
  };
}

export function initialize(token: string) {
  memToken = token;
}

export function appendToken(url: string) {
  return `${url}&oauth_token=${memToken}`;
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
