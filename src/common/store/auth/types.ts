import { Normalized, ObjectMap, SoundCloud } from '@types';
import { AxiosError } from 'axios';
import { EpicError } from '@common/utils/errors/EpicError';

// TYPES

export type AuthState = Readonly<{
  me: {
    isLoading: boolean;
    error?: EpicError | AxiosError | Error | null;
    data?: SoundCloud.User;
  };
  followings: AuthFollowing;
  likes: AuthLikes;
  reposts: AuthReposts;
  playlists: {
    isLoading: boolean;
    error?: EpicError | AxiosError | Error | null;
    data: AuthPlaylists;
  };
  personalizedPlaylists: {
    loading: boolean;
    error?: EpicError | AxiosError | Error | null;
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
  GET_USER = '@@auth/GET_USER',
  GET_USER_FOLLOWINGS_IDS = '@@auth/GET_USER_FOLLOWINGS_IDS',
  GET_USER_LIKE_IDS = '@@auth/GET_USER_LIKE_IDS',
  GET_USER_REPOST_IDS = '@@auth/GET_USER_REPOST_IDS',
  GET_USER_PLAYLISTS = '@@auth/GET_USER_PLAYLISTS',

  TOGGLE_LIKE = '@@track/TOGGLE_LIKE',
  TOGGLE_REPOST = '@@track/TOGGLE_REPOST',
  TOGGLE_FOLLOWING = '@@track/TOGGLE_FOLLOWING',

  // OLD?

  SET = '@@auth/SET',
  SET_PLAYLISTS = '@@auth/SET_PLAYLISTS',
  SET_PERSONALIZED_PLAYLISTS = '@@auth/SET_PERSONALIZED_PLAYLISTS',
  SET_FOLLOWINGS = '@@auth/SET_FOLLOWINGS',
  SET_LIKES = '@@auth/SET_LIKES',
  SET_PLAYLIST_LIKES = '@@auth/SET_PLAYLIST_LIKES',
  SET_REPOSTS = '@@auth/SET_REPOSTS',
  SET_PLAYLIST_REPOSTS = '@@auth/SET_PLAYLIST_REPOSTS',
  SET_LIKE = '@@auth/SET_LIKE',
  SET_FOLLOWING = '@@auth/SET_FOLLOWING',
  SET_REPOST = '@@auth/SET_REPOST',
  ERROR = '@@auth/ERROR',
  LOADING = '@@auth/LOADING'
}
