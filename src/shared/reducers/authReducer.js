import { actionTypes } from '../constants';
import { onSuccess } from '../utils/reduxUtils';

const initialState = {
    me: {},
    followings: {},
    likes: {
        track: {},
        playlist: {}
    },
    reposts: {},
    playlists: [],
    newFeedItems: [],
    authentication: {
        loading: false,
        error: null
    }
};

export default function (state = initialState, action) {
    const { payload, type } = action;

    switch (type) {
        case actionTypes.AUTH_ERROR:
            return {
                ...state,
                authentication: {
                    loading: false,
                    error: payload
                }
            };
        case actionTypes.AUTH_LOADING:
            return {
                ...state,
                authentication: {
                    loading: payload,
                    error: null
                }
            };
        case actionTypes.CONFIG_SET_TOKEN:
            return {
                ...state,
                authentication: {
                    loading: false
                }
            };
        case onSuccess(actionTypes.AUTH_SET_NEW_FEED_ITEMS):
            return {
                ...state,
                newFeedItems: [...payload.result, ...state.newFeedItems]
            };
        case onSuccess(actionTypes.AUTH_SET):
            return {
                ...state,
                me: payload
            };
        case onSuccess(actionTypes.AUTH_SET_LIKES):
            return {
                ...state,
                likes: {
                    ...state.likes,
                    track: payload
                }
            };
        case onSuccess(actionTypes.AUTH_SET_PLAYLIST_LIKES):
            return {
                ...state,
                likes: {
                    ...state.likes,
                    playlist: payload
                }
            };
        case onSuccess(actionTypes.AUTH_SET_FOLLOWINGS):
            return {
                ...state,
                followings: payload
            };
        case onSuccess(actionTypes.AUTH_SET_REPOSTS):
            return {
                ...state,
                reposts: payload
            };
        case onSuccess(actionTypes.AUTH_SET_PLAYLISTS):
            return {
                ...state,
                playlists: payload.result
            };
        case onSuccess(actionTypes.AUTH_SET_LIKE):

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
        case onSuccess(actionTypes.AUTH_SET_FOLLOWING):
            return {
                ...state,
                followings: {
                    ...state.followings,
                    [payload.user_id]: payload.following
                }
            };
        case onSuccess(actionTypes.AUTH_SET_REPOST):
            return {
                ...state,
                reposts: {
                    ...state.reposts,
                    [payload.trackId]: payload.reposted
                }
            };
        case actionTypes.APP_RESET_STORE:
            return initialState;
        default:
            return state;
    }
}
