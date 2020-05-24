import { replace } from 'connected-react-router';
import { action } from 'typesafe-actions';
import { ThunkResult } from '..';
import { SoundCloud } from '../../../types';
import fetchPersonalised from '../../api/fetchPersonalised';
import fetchPlaylists from '../../api/fetchPlaylists';
import fetchToJson from '../../api/helpers/fetchToJson';
import fetchToObject from '../../api/helpers/fetchToObject';
import { SC } from '../../utils';
import { setToken } from '../config/actions';
import { ObjectTypes, PlaylistTypes } from '../objects';
import { getPlaylist, setObject } from '../objects/actions';
import { getPlaylistObjectSelector } from '../objects/selectors';
import { AuthActionTypes } from './types';
import { AppActionTypes } from '../app';

export function logout(): ThunkResult<void> {
  return dispatch => {
    dispatch({
      type: AppActionTypes.RESET_STORE
    });
    dispatch(replace('/login'));
    dispatch(setToken(null));
  };
}

export const setLoginError = (data: string) => action(AuthActionTypes.ERROR, data);

export const setLoginLoading = (loading = true) => action(AuthActionTypes.LOADING, loading);

export function getAuth(): ThunkResult<void> {
  return (dispatch, getState) => {
    const {
      config: {
        app: { analytics }
      }
    } = getState();

    dispatch(
      action(
        AuthActionTypes.SET,
        fetchToJson<SoundCloud.User>(SC.getMeUrl()).then(user => {
          if (process.env.NODE_ENV === 'production' && analytics) {
            // eslint-disable-next-line
            const { ua } = require('../../utils/universalAnalytics');

            ua.set('userId', user.id);
          }

          return user;
        })
      )
    );
  };
}

export function getAuthTracksIfNeeded(): ThunkResult<void> {
  return (dispatch, getState) => {
    const state = getState();
    const {
      auth: { me }
    } = state;

    if (!me || !me.id) {
      return;
    }

    const playlistObject = getPlaylistObjectSelector(PlaylistTypes.MYTRACKS)(state);

    if (!playlistObject) {
      dispatch(getPlaylist(SC.getUserTracksUrl(me.id), PlaylistTypes.MYTRACKS));
    }
  };
}

export function getAuthAllPlaylistsIfNeeded(): ThunkResult<void> {
  return (dispatch, getState) => {
    const state = getState();
    const {
      auth: { me }
    } = state;

    if (!me || !me.id) {
      return;
    }

    const playlistObject = getPlaylistObjectSelector(PlaylistTypes.PLAYLISTS)(state);

    if (!playlistObject) {
      dispatch(getPlaylist(SC.getAllUserPlaylistsUrl(me.id), PlaylistTypes.PLAYLISTS));
    }
  };
}

export function getAuthLikeIds(): ThunkResult<Promise<any>> {
  return dispatch => {
    return Promise.all([
      dispatch({
        type: AuthActionTypes.SET_LIKES,
        payload: fetchToObject(SC.getLikeIdsUrl())
      }),
      dispatch({
        type: AuthActionTypes.SET_PLAYLIST_LIKES,
        payload: fetchToObject(SC.getPlaylistLikeIdsUrl())
      })
    ]);
  };
}

export function getAuthLikesIfNeeded(): ThunkResult<void> {
  return (dispatch, getState) => {
    const playlistObject = getPlaylistObjectSelector(PlaylistTypes.LIKES)(getState());

    if (!playlistObject) {
      dispatch(getPlaylist(SC.getLikesUrl(), PlaylistTypes.LIKES));
    }
  };
}

export const getAuthFollowings = (): ThunkResult<void> => (dispatch, getState) => {
  const state = getState();
  const {
    auth: { me }
  } = state;

  if (!me || !me.id) {
    return;
  }

  dispatch(action(AuthActionTypes.SET_FOLLOWINGS, fetchToObject(SC.getFollowingsUrl(me.id.toString()))));
};

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

export function getAuthReposts(): ThunkResult<Promise<any>> {
  return dispatch =>
    Promise.all([
      dispatch({
        type: AuthActionTypes.SET_REPOSTS,
        payload: fetchToObject(SC.getRepostIdsUrl())
      }),
      dispatch({
        type: AuthActionTypes.SET_PLAYLIST_REPOSTS,
        payload: fetchToObject(SC.getRepostIdsUrl(true))
      })
    ]);
}

export function getAuthFeed(refresh?: boolean): ThunkResult<Promise<any>> {
  return async (dispatch, getState) => {
    const {
      config: { hideReposts }
    } = getState();

    return dispatch<Promise<any>>(getPlaylist(SC.getFeedUrl(hideReposts ? 40 : 20), PlaylistTypes.STREAM, { refresh }));
  };
}

/**
 * Get playlists from the authenticated user
 */
export function getAuthPlaylists(): ThunkResult<any> {
  return dispatch =>
    dispatch({
      type: AuthActionTypes.SET_PLAYLISTS,
      payload: {
        promise: fetchPlaylists().then(({ normalized }) => {
          normalized.result.forEach(playlistResult => {
            if (normalized.entities.playlistEntities && normalized.entities.playlistEntities[playlistResult.id]) {
              const playlist = normalized.entities.playlistEntities[playlistResult.id];

              dispatch(setObject(playlistResult.id.toString(), ObjectTypes.PLAYLISTS, {}, playlist.tracks));
            }
          });

          return normalized;
        })
      }
    });
}

export function fetchPersonalizedPlaylistsIfNeeded(): ThunkResult<void> {
  return async (dispatch, getState) => {
    const {
      auth: { personalizedPlaylists }
    } = getState();

    if (!personalizedPlaylists.items && !personalizedPlaylists.loading) {
      return dispatch<Promise<any>>({
        type: AuthActionTypes.SET_PERSONALIZED_PLAYLISTS,
        payload: {
          promise: fetchPersonalised(SC.getPersonalizedurl()).then(({ normalized }) => {
            normalized.result.forEach(playlistResult => {
              (playlistResult.items.collection || []).forEach(playlistId => {
                if (normalized.entities.playlistEntities && normalized.entities.playlistEntities[playlistId]) {
                  const playlist = normalized.entities.playlistEntities[playlistId];

                  dispatch(
                    setObject(
                      playlistId.toString(),
                      ObjectTypes.PLAYLISTS,
                      {},
                      playlist.tracks,
                      undefined,
                      undefined,
                      0
                    )
                  );
                }
              });
            });

            return {
              entities: normalized.entities,
              items: normalized.result
            };
          })
        }
      } as any);
    }

    return Promise.resolve();
  };
}
