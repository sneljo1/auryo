import { wError, wSuccess } from '@common/utils/reduxUtils';
import { EntitiesOf, EpicFailure, ObjectMap, SoundCloud, ThunkResult } from '@types';
import { createAsyncAction } from 'typesafe-actions';
import fetchPersonalised from '../../api/fetchPersonalised';
import fetchToJson from '../../api/helpers/fetchToJson';
import { SC } from '../../utils';
import { ObjectTypes } from '../objects';
import { setObject } from '../objects/actions';
import { FetchedPlaylistItem } from './api';
import { AuthActionTypes, AuthLikes, AuthPlaylists, AuthReposts } from './types';

// AUTH DATA
export const getCurrentUser = createAsyncAction(
  AuthActionTypes.GET_USER,
  wSuccess(AuthActionTypes.GET_USER),
  wError(AuthActionTypes.GET_USER)
)<undefined, SoundCloud.User, EpicFailure>();

export const getCurrentUserFollowingsIds = createAsyncAction(
  AuthActionTypes.GET_USER_FOLLOWINGS_IDS,
  wSuccess(AuthActionTypes.GET_USER_FOLLOWINGS_IDS),
  wError(AuthActionTypes.GET_USER_FOLLOWINGS_IDS)
)<undefined, ObjectMap, EpicFailure>();

export const getCurrentUserLikeIds = createAsyncAction(
  AuthActionTypes.GET_USER_LIKE_IDS,
  wSuccess(AuthActionTypes.GET_USER_LIKE_IDS),
  wError(AuthActionTypes.GET_USER_LIKE_IDS)
)<undefined, AuthLikes, EpicFailure>();

export const getCurrentUserRepostIds = createAsyncAction(
  AuthActionTypes.GET_USER_REPOST_IDS,
  wSuccess(AuthActionTypes.GET_USER_REPOST_IDS),
  wError(AuthActionTypes.GET_USER_REPOST_IDS)
)<undefined, AuthReposts, EpicFailure>();

export const getCurrentUserPlaylists = createAsyncAction(
  AuthActionTypes.GET_USER_PLAYLISTS,
  wSuccess(AuthActionTypes.GET_USER_PLAYLISTS),
  wError(AuthActionTypes.GET_USER_PLAYLISTS)
)<undefined, AuthPlaylists & { entities: EntitiesOf<FetchedPlaylistItem> }, EpicFailure>();

// export function getAuth(): ThunkResult<void> {
//   return (dispatch, getState) => {
//     const {
//       config: {
//         app: { analytics }
//       }
//     } = getState();

//     dispatch(
//       action(
//         AuthActionTypes.SET,
//         fetchToJson<SoundCloud.User>(SC.getMeUrl()).then(user => {
//           if (process.env.NODE_ENV === 'production' && analytics) {
//             // eslint-disable-next-line
//             const { ua } = require('../../utils/universalAnalytics');

//             ua.set('userId', user.id);
//           }

//           return user;
//         })
//       )
//     );
//   };
// }

// export function getAuthTracksIfNeeded(): ThunkResult<void> {
//   return (dispatch, getState) => {
//     const state = getState();

//     const currentUser = currentUserSelector(state);

//     if (!currentUser?.id) {
//       return;
//     }

//     const playlistObject = getPlaylistObjectSelector(PlaylistTypes.MYTRACKS)(state);

//     if (!playlistObject) {
//       dispatch(getPlaylistO(SC.getUserTracksUrl(currentUser.id), PlaylistTypes.MYTRACKS));
//     }
//   };
// }

// export function getAuthAllPlaylistsIfNeeded(): ThunkResult<void> {
//   return (dispatch, getState) => {
//     const state = getState();

//     const currentUser = currentUserSelector(state);

//     if (!currentUser?.id) {
//       return;
//     }

//     const playlistObject = getPlaylistObjectSelector(PlaylistTypes.PLAYLISTS)(state);

//     if (!playlistObject) {
//       dispatch(getPlaylistO(SC.getAllUserPlaylistsUrl(currentUser.id), PlaylistTypes.PLAYLISTS));
//     }
//   };
// }

// export function getAuthLikeIds(): ThunkResult<Promise<any>> {
//   return dispatch => {
//     return Promise.all([
//       dispatch({
//         type: AuthActionTypes.SET_LIKES,
//         payload: fetchToObject(SC.getLikeIdsUrl())
//       }),
//       dispatch({
//         type: AuthActionTypes.SET_PLAYLIST_LIKES,
//         payload: fetchToObject(SC.getPlaylistLikeIdsUrl())
//       })
//     ]);
//   };
// }

// export function getAuthLikesIfNeeded(): ThunkResult<void> {
//   return (dispatch, getState) => {
//     const playlistObject = getPlaylistObjectSelector(PlaylistTypes.LIKES)(getState());

//     if (!playlistObject) {
//       dispatch(getPlaylistO(SC.getLikesUrl(), PlaylistTypes.LIKES));
//     }
//   };
// }

// export const getAuthFollowings = () => action(AuthActionTypes.SET_FOLLOWINGS, fetchToObject(SC.getFollowingsUrl()));

/**
 * Toggle following of a specific user
 */
export function toggleFollowing(userId: number): ThunkResult<void> {
  return (dispatch, getState) => {
    const {
      auth: { followings }
    } = getState();

    const following = SC.hasID(userId, followings);

    dispatch({
      type: AuthActionTypes.SET_FOLLOWING,
      payload: fetchToJson(SC.updateFollowingUrl(userId), {
        method: !following ? 'PUT' : 'DELETE'
      }).then(() => ({
        userId,
        following: !following
      }))
    });
  };
}

// export function getAuthReposts(): ThunkResult<Promise<any>> {
//   return dispatch =>
//     Promise.all([
//       dispatch({
//         type: AuthActionTypes.SET_REPOSTS,
//         payload: fetchToObject(SC.getRepostIdsUrl())
//       }),
//       dispatch({
//         type: AuthActionTypes.SET_PLAYLIST_REPOSTS,
//         payload: fetchToObject(SC.getRepostIdsUrl(true))
//       })
//     ]);
// }

// export function getAuthFeed(refresh?: boolean): ThunkResult<Promise<any>> {
//   return async (dispatch, getState) => {
//     const {
//       config: { hideReposts }
//     } = getState();

//     return dispatch<Promise<any>>(
//       getPlaylistO(SC.getFeedUrl(hideReposts ? 40 : 20), PlaylistTypes.STREAM, { refresh })
//     );
//   };
// }

/**
 * Get playlists from the authenticated user
 */
// export function getAuthPlaylists(): ThunkResult<any> {
//   return dispatch =>
//     dispatch({
//       type: AuthActionTypes.SET_PLAYLISTS,
//       payload: {
//         promise: fetchPlaylists().then(({ normalized }) => {
//           normalized.result.forEach(playlistResult => {
//             if (normalized.entities.playlistEntities && normalized.entities.playlistEntities[playlistResult.id]) {
//               const playlist = normalized.entities.playlistEntities[playlistResult.id];

//               dispatch(setObject(playlistResult.id.toString(), ObjectTypes.PLAYLISTS, {}, playlist.tracks));
//             }
//           });

//           return normalized;
//         })
//       }
//     });
// }

// export function fetchPersonalizedPlaylistsIfNeeded(): ThunkResult<void> {
//   return async (dispatch, getState) => {
//     const {
//       auth: { personalizedPlaylists }
//     } = getState();

//     if (!personalizedPlaylists.items && !personalizedPlaylists.loading) {
//       return dispatch<Promise<any>>({
//         type: AuthActionTypes.SET_PERSONALIZED_PLAYLISTS,
//         payload: {
//           promise: fetchPersonalised(SC.getPersonalizedurl()).then(({ normalized }) => {
//             normalized.result.forEach(playlistResult => {
//               (playlistResult.items.collection || []).forEach(playlistId => {
//                 if (normalized.entities.playlistEntities && normalized.entities.playlistEntities[playlistId]) {
//                   const playlist = normalized.entities.playlistEntities[playlistId];

//                   dispatch(
//                     setObject(
//                       playlistId.toString(),
//                       ObjectTypes.PLAYLISTS,
//                       {},
//                       playlist.tracks || [],
//                       undefined,
//                       undefined,
//                       0
//                     )
//                   );
//                 }
//               });
//             });

//             return {
//               entities: normalized.entities,
//               items: normalized.result
//             };
//           })
//         }
//       } as any);
//     }

//     return Promise.resolve();
//   };
// }
