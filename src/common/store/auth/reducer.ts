import { createReducer } from 'typesafe-actions';
import {
  getCurrentUser,
  getCurrentUserFollowingsIds,
  getCurrentUserLikeIds,
  getCurrentUserPlaylists,
  getCurrentUserRepostIds,
  getForYouSelection,
  resetStore,
  toggleLike,
  toggleRepost
} from '../actions';
import { AuthState } from './types';
import { toggleFollowing } from './actions';

const initialState: AuthState = {
  me: {
    isLoading: false
  },
  followings: {},
  likes: {
    track: {},
    playlist: {},
    systemPlaylist: {}
  },
  reposts: {
    track: {},
    playlist: {}
  },
  playlists: {
    isLoading: false,
    data: {
      liked: [],
      owned: []
    }
  },
  personalizedPlaylists: {
    isLoading: false,
    items: null
  }
};

export const authReducer = createReducer<AuthState>(initialState)
  .handleAction(getCurrentUser.request, (state) => {
    return {
      ...state,
      me: {
        ...state.me,
        isLoading: true,
        error: null
      }
    };
  })
  .handleAction(getCurrentUser.success, (state, action) => {
    return {
      ...state,
      me: {
        ...state.me,
        isLoading: false,
        data: action.payload
      }
    };
  })
  .handleAction(getCurrentUser.failure, (state, action) => {
    return {
      ...state,
      me: {
        ...state.me,
        isLoading: false,
        error: action.payload as any
      }
    };
  })
  // TODO handle getCurrentUserFollowings error & loading?
  .handleAction(getCurrentUserFollowingsIds.success, (state, action) => {
    return {
      ...state,
      followings: action.payload
    };
  })
  .handleAction(toggleFollowing.success, (state, action) => {
    const { userId, follow } = action.payload;
    const { followings } = state;

    if (follow) {
      followings[userId] = follow;
    } else {
      delete followings[userId];
    }

    return {
      ...state,
      followings: {
        ...followings
      }
    };
  })
  // TODO handle getCurrentUserLikeIds error & loading?
  .handleAction(getCurrentUserLikeIds.success, (state, action) => {
    return {
      ...state,
      likes: action.payload
    };
  })
  .handleAction(toggleLike.success, (state, action) => {
    const { id, type, liked } = action.payload;
    const likes = state.likes[type];

    if (liked) {
      likes[id] = liked;
    } else {
      delete likes[id];
    }

    return {
      ...state,
      likes: {
        ...state.likes,
        [type]: {
          ...likes
        }
      }
    };
  })
  // TODO handle getCurrentUserRepostIds error & loading?
  .handleAction(getCurrentUserRepostIds.success, (state, action) => {
    return {
      ...state,
      reposts: action.payload
    };
  })
  .handleAction(toggleRepost.success, (state, action) => {
    const { id, type, reposted } = action.payload;
    const reposts = state.reposts[type];

    if (reposted) {
      reposts[id] = reposted;
    } else {
      delete reposts[id];
    }

    return {
      ...state,
      reposts: {
        ...state.reposts,
        [type]: {
          ...reposts
        }
      }
    };
  })
  .handleAction(getCurrentUserPlaylists.request, (state) => {
    return {
      ...state,
      playlists: {
        ...state.playlists,
        isLoading: true,
        error: null
      }
    };
  })
  .handleAction(getCurrentUserPlaylists.success, (state, action) => {
    return {
      ...state,
      playlists: {
        ...state.playlists,
        isLoading: false,
        data: action.payload
      }
    };
  })
  .handleAction(getCurrentUserPlaylists.failure, (state, action) => {
    return {
      ...state,
      playlists: {
        ...state.playlists,
        isLoading: false,
        error: action.payload.error
      }
    };
  })
  .handleAction(getForYouSelection.request, (state) => {
    return {
      ...state,
      personalizedPlaylists: {
        ...state.personalizedPlaylists,
        isLoading: true,
        error: null
      }
    };
  })
  .handleAction(getForYouSelection.success, (state, action) => {
    return {
      ...state,
      personalizedPlaylists: {
        ...state.personalizedPlaylists,
        isLoading: false,
        items: action.payload.result
      }
    };
  })
  .handleAction(getForYouSelection.failure, (state, action) => {
    return {
      ...state,
      personalizedPlaylists: {
        ...state.personalizedPlaylists,
        isLoading: false,
        error: action.payload.error
      }
    };
  })
  .handleAction(resetStore, () => initialState);
