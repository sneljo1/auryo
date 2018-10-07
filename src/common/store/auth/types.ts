import { SoundCloud, NormalizedResult } from '../../../types';

// TYPES

export interface AuthState extends Readonly<{
    me: AuthUser | null;
    followings: AuthFollowing;
    likes: AuthLikes,
    reposts: AuthReposts,
    playlists: Array<NormalizedResult>;
    authentication: AuthStatus
}> { }

export interface AuthFollowing {
    [userId: string]: boolean;
}

export interface AuthLikes {
    track: {
        [trackId: string]: boolean
    };
    playlist: {
        [playlistId: string]: boolean
    };
}
export interface AuthReposts {
    [userId: string]: boolean;
}

export interface AuthUser extends SoundCloud.User {

}

export interface AuthStatus {
    loading: boolean;
    error: string | null;
}

// ACTIONS

export const enum AuthActionTypes {
    SET = '@@auth/SET',
    SET_PLAYLISTS = '@@auth/SET_PLAYLISTS',
    SET_FOLLOWINGS = '@@auth/SET_FOLLOWINGS',
    SET_LIKES = '@@auth/SET_LIKES',
    SET_PLAYLIST_LIKES = '@@auth/SET_PLAYLIST_LIKES',
    SET_REPOSTS = '@@auth/SET_REPOSTS',
    SET_LIKE = '@@auth/SET_LIKE',
    SET_FOLLOWING = '@@auth/SET_FOLLOWING',
    SET_REPOST = '@@auth/SET_REPOST',
    ERROR = '@@auth/ERROR',
    LOADING = '@@auth/LOADING',
}
