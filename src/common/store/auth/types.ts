import { Normalized, SoundCloud } from '@types';

// TYPES

export type AuthState = Readonly<{
  me: AuthUser | null;
  followings: AuthFollowing;
  likes: AuthLikes;
  reposts: AuthReposts;
  playlists: Normalized.NormalizedResult[];
  authentication: AuthStatus;
  personalizedPlaylists: {
    loading: boolean;
    items: Normalized.NormalizedPersonalizedItem[] | null;
  };
}>;

export interface AuthFollowing {
  [userId: string]: boolean;
}

export interface AuthLikes {
  track: {
    [trackId: string]: boolean;
  };
  playlist: {
    [playlistId: string]: boolean;
  };
}
export interface AuthReposts {
  track: {
    [trackId: string]: boolean;
  };
  playlist: {
    [playlistId: string]: boolean;
  };
}

export type AuthUser = SoundCloud.User;

export interface AuthStatus {
  loading: boolean;
  error: string | null;
}

// ACTIONS

export enum AuthActionTypes {
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
