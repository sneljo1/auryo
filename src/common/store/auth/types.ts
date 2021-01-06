import { EpicError } from '@common/utils/errors/EpicError';
import { Normalized, ObjectMap, SoundCloud } from '@types';

// TYPES

export type AuthState = Readonly<{
  me: {
    isLoading: boolean;
    error?: EpicError | Error | null;
    data?: SoundCloud.User;
  };
  followings: AuthFollowing;
  likes: AuthLikes;
  reposts: AuthReposts;
  playlists: {
    isLoading: boolean;
    error?: EpicError | Error | null;
    data: AuthPlaylists;
  };
  personalizedPlaylists: {
    loading: boolean;
    error?: EpicError | Error | null;
    items: Normalized.NormalizedPersonalizedItem[] | null;
  };
}>;

export interface AuthFollowing {
  [userId: string]: boolean;
}
export interface AuthPlaylists {
  liked: Normalized.NormalizedResult[];
  owned: Normalized.NormalizedResult[];
}

export interface AuthLikes {
  track: ObjectMap;
  playlist: ObjectMap;
  systemPlaylist: ObjectMap;
}

export interface AuthReposts {
  track: ObjectMap;
  playlist: ObjectMap;
}

export enum LikeType {
  Playlist = 'playlist',
  Track = 'track',
  SystemPlaylist = 'systemPlaylist'
}
export enum RepostType {
  Playlist = 'playlist',
  Track = 'track'
}

// ACTIONS

export enum AuthActionTypes {
  GET_USER = 'auryo.auth.GET_USER',
  GET_USER_FOLLOWINGS_IDS = 'auryo.auth.GET_USER_FOLLOWINGS_IDS',
  GET_USER_LIKE_IDS = 'auryo.auth.GET_USER_LIKE_IDS',
  GET_USER_REPOST_IDS = 'auryo.auth.GET_USER_REPOST_IDS',
  GET_USER_PLAYLISTS = 'auryo.auth.GET_USER_PLAYLISTS',

  TOGGLE_LIKE = 'auryo.track.TOGGLE_LIKE',
  TOGGLE_REPOST = 'auryo.track.TOGGLE_REPOST',
  TOGGLE_FOLLOWING = 'auryo.track.TOGGLE_FOLLOWING',

  // OLD?

  SET = 'auryo.auth.SET',
  SET_PLAYLISTS = 'auryo.auth.SET_PLAYLISTS',
  SET_PERSONALIZED_PLAYLISTS = 'auryo.auth.SET_PERSONALIZED_PLAYLISTS',
  SET_FOLLOWINGS = 'auryo.auth.SET_FOLLOWINGS',
  SET_LIKES = 'auryo.auth.SET_LIKES',
  SET_PLAYLIST_LIKES = 'auryo.auth.SET_PLAYLIST_LIKES',
  SET_REPOSTS = 'auryo.auth.SET_REPOSTS',
  SET_PLAYLIST_REPOSTS = 'auryo.auth.SET_PLAYLIST_REPOSTS',
  SET_LIKE = 'auryo.auth.SET_LIKE',
  SET_FOLLOWING = 'auryo.auth.SET_FOLLOWING',
  SET_REPOST = 'auryo.auth.SET_REPOST',
  ERROR = 'auryo.auth.ERROR',
  LOADING = 'auryo.auth.LOADING'
}
