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
    loading: false,
    items: null
  }
};

export const authReducer = createReducer<AuthState>(initialState)
  .handleAction(getCurrentUser.request, state => {
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
        error: action.payload.error
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
  .handleAction(getCurrentUserPlaylists.request, state => {
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
  .handleAction(getForYouSelection.request, state => {
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

// tslint:disable-next-line: max-func-body-length cyclomatic-complexity
// export const authReducer: Reducer<AuthState> = (state = initialState, action) => {
//   const { payload, type } = action;

//   switch (type) {
//     case onSuccess(AuthActionTypes.SET):
//       return {
//         ...state,
//         me: payload
//       };
//     case onSuccess(AuthActionTypes.SET_LIKES):
//       return {
//         ...state,
//         likes: {
//           ...state.likes,
//           track: payload
//         }
//       };
//     case onSuccess(AuthActionTypes.SET_PLAYLIST_LIKES):
//       return {
//         ...state,
//         likes: {
//           ...state.likes,
//           playlist: payload
//         }
//       };
//     case onSuccess(AuthActionTypes.SET_FOLLOWINGS):
//       return {
//         ...state,
//         followings: payload
//       };
//     case onSuccess(AuthActionTypes.SET_REPOSTS):
//       return {
//         ...state,
//         reposts: payload
//       };
//     case onSuccess(AuthActionTypes.SET_PLAYLIST_REPOSTS):
//       return {
//         ...state,
//         reposts: {
//           ...state.reposts,
//           playlist: payload
//         }
//       };
//     case onSuccess(AuthActionTypes.SET_PLAYLISTS):
//       return {
//         ...state,
//         playlists: payload.result
//       };
//     case onSuccess(AuthActionTypes.SET_LIKE):
//       if (payload.playlist) {
//         return {
//           ...state,
//           likes: {
//             ...state.likes,
//             playlist: {
//               ...state.likes.playlist,
//               [payload.trackId]: payload.liked
//             }
//           }
//         };
//       }

//       return {
//         ...state,
//         likes: {
//           ...state.likes,
//           track: {
//             ...state.likes.track,
//             [payload.trackId]: payload.liked
//           }
//         }
//       };
//     case onSuccess(AuthActionTypes.SET_REPOST):
//       if (payload.playlist) {
//         return {
//           ...state,
//           reposts: {
//             ...state.reposts,
//             playlist: {
//               ...state.reposts.playlist,
//               [payload.trackId]: payload.reposted
//             }
//           }
//         };
//       }

//       return {
//         ...state,
//         reposts: {
//           ...state.reposts,
//           track: {
//             ...state.reposts.track,
//             [payload.trackId]: payload.reposted
//           }
//         }
//       };
//     case onSuccess(AuthActionTypes.SET_FOLLOWING):
//       return {
//         ...state,
//         followings: {
//           ...state.followings,
//           [payload.userId]: payload.following
//         }
//       };
//     case isLoading(AuthActionTypes.SET_PERSONALIZED_PLAYLISTS):
//       return {
//         ...state,
//         personalizedPlaylists: {
//           ...state.personalizedPlaylists,
//           loading: true
//         }
//       };
//     case onError(AuthActionTypes.SET_PERSONALIZED_PLAYLISTS):
//       return {
//         ...state,
//         personalizedPlaylists: {
//           ...state.personalizedPlaylists,
//           loading: false
//         }
//       };
//     case onSuccess(AuthActionTypes.SET_PERSONALIZED_PLAYLISTS):
//       return {
//         ...state,
//         personalizedPlaylists: {
//           loading: false,
//           items: payload.items
//         }
//       };
//     case AppActionTypes.RESET_STORE:
//       return initialState;
//     default:
//       return state;
//   }
// };
