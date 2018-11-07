import { Reducer } from 'redux';
import { onSuccess } from '../../utils/reduxUtils';
import { AppActionTypes } from '../app';
import { ConfigActionTypes } from '../config';
import { AuthActionTypes, AuthState } from './types';

const initialState = {
    me: null,
    followings: {},
    likes: {
        track: {},
        playlist: {}
    },
    reposts: {
        track: {},
        playlist: {}
    },
    playlists: [],
    authentication: {
        loading: false,
        error: null
    }
};

export const authReducer: Reducer<AuthState> = (state = initialState, action) => {
    const { payload, type } = action;

    switch (type) {
        case AuthActionTypes.ERROR:
            return {
                ...state,
                authentication: {
                    loading: false,
                    error: payload || null
                }
            };
        case AuthActionTypes.LOADING:
            return {
                ...state,
                authentication: {
                    loading: payload,
                    error: null
                }
            };
        case ConfigActionTypes.SET_TOKEN:
            return {
                ...state,
                authentication: {
                    ...state.authentication,
                    loading: false,
                }
            };

        case onSuccess(AuthActionTypes.SET):
            return {
                ...state,
                me: payload
            };
        case onSuccess(AuthActionTypes.SET_LIKES):
            return {
                ...state,
                likes: {
                    ...state.likes,
                    track: payload
                }
            };
        case onSuccess(AuthActionTypes.SET_PLAYLIST_LIKES):
            return {
                ...state,
                likes: {
                    ...state.likes,
                    playlist: payload
                }
            };
        case onSuccess(AuthActionTypes.SET_FOLLOWINGS):
            return {
                ...state,
                followings: payload
            };
        case onSuccess(AuthActionTypes.SET_REPOSTS):
            return {
                ...state,
                reposts: payload
            };
        case onSuccess(AuthActionTypes.SET_PLAYLIST_REPOSTS):
            return {
                ...state,
                reposts: {
                    ...state.reposts,
                    playlist: payload
                }
            };
        case onSuccess(AuthActionTypes.SET_PLAYLISTS):
            return {
                ...state,
                playlists: payload.result
            };
        case onSuccess(AuthActionTypes.SET_LIKE):

            if (payload.playlist) {
                return {
                    ...state,
                    likes: {
                        ...state.likes,
                        playlist: {
                            ...state.likes.playlist,
                            [payload.trackId]: payload.liked
                        }
                    }
                };
            }
            return {
                ...state,
                likes: {
                    ...state.likes,
                    track: {
                        ...state.likes.track,
                        [payload.trackId]: payload.liked
                    }
                }
            };
        case onSuccess(AuthActionTypes.SET_REPOST):
            if (payload.playlist) {
                return {
                    ...state,
                    reposts: {
                        ...state.reposts,
                        playlist: {
                            ...state.reposts.playlist,
                            [payload.trackId]: payload.reposted
                        }
                    }
                };
            }

            return {
                ...state,
                reposts: {
                    ...state.reposts,
                    track: {
                        ...state.reposts.track,
                        [payload.trackId]: payload.reposted
                    }
                }
            };
        case onSuccess(AuthActionTypes.SET_FOLLOWING):
            return {
                ...state,
                followings: {
                    ...state.followings,
                    [payload.userId]: payload.following
                }
            };
        case AppActionTypes.RESET_STORE:
            return initialState;
        default:
            return state;
    }
};
