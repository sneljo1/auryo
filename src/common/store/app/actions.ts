import { push, replace, goBack } from 'connected-react-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import is from 'electron-is';
import { action } from 'typesafe-actions';
import { ThunkResult } from '..';
import { fetchRemainingTracks } from '../../api/fetchRemainingTracks';
import { EVENTS } from '../../constants/events';
import { SC } from '../../utils';
import {
  getAuth,
  getAuthFeed,
  getAuthFollowings,
  getAuthLikeIds,
  getAuthLikesIfNeeded,
  getAuthPlaylists,
  getAuthReposts
} from '../auth/actions';
import { toggleLike, toggleRepost } from '../track/actions';
import { AppActionTypes, CanGoHistory, CastAppState, ChromeCastDevice, DevicePlayerStatus, Dimensions } from './types';
import fetchToJson from '@common/api/helpers/fetchToJson';
import { SoundCloud } from '@types';
import { IPC } from '@common/utils/ipc';

export function getRemainingPlays(): ThunkResult<void> {
  return (dispatch, getState) => {
    const {
      config: {
        app: { overrideClientId }
      }
    } = getState();

    dispatch({
      type: AppActionTypes.SET_REMAINING_PLAYS,
      payload: fetchRemainingTracks(overrideClientId || undefined)
    });
  };
}

export const setDimensions = (dimensions: Dimensions) => action(AppActionTypes.SET_DIMENSIONS, dimensions);
export const canGoInHistory = (canGoHistory: CanGoHistory) => action(AppActionTypes.SET_CAN_GO, canGoHistory);
export const setLastfmLoading = (loading: boolean) => action(AppActionTypes.SET_LASTFM_LOADING, loading);
export const addChromeCastDevice = (device: ChromeCastDevice) =>
  action(AppActionTypes.ADD_CHROMECAST_DEVICE, {
    device
  });
export const removeChromeCastDevice = (deviceId: string) =>
  action(AppActionTypes.REMOVE_CHROMECAST_DEVICE, {
    deviceId
  });
export const useChromeCast = (deviceId?: string) => action(AppActionTypes.SET_CHROMECAST_DEVICE, deviceId);
export const setChromeCastPlayerStatus = (playerStatus: DevicePlayerStatus) =>
  action(AppActionTypes.SET_CHROMECAST_PLAYER_STATUS, playerStatus);
export const setChromecastAppState = (state: CastAppState | null) =>
  action(AppActionTypes.SET_CHROMECAST_APP_STATE, state);

export const toggleOffline = (offline: boolean) =>
  action(AppActionTypes.TOGGLE_OFFLINE, {
    time: new Date().getTime(),
    offline
  });
export const setUpdateAvailable = (version: string) =>
  action(AppActionTypes.SET_UPDATE_AVAILABLE, {
    version
  });

let listeners: any[] = [];

export function initWatchers(): ThunkResult<any> {
  // tslint:disable-next-line: max-func-body-length
  return dispatch => {
    if (!listeners.length) {
      listeners.push({
        event: EVENTS.APP.PUSH_NAVIGATION,
        handler: (_e: any, path: string, url: string) => {
          dispatch(
            push({
              pathname: path,
              search: url
            })
          );
        }
      });

      listeners.push({
        event: EVENTS.TRACK.LIKE,
        handler: (_e: any, trackId: string) => {
          if (trackId) {
            dispatch(toggleLike(+trackId, false)); // TODO determine if track or playlist
          }
        }
      });

      listeners.push({
        event: EVENTS.TRACK.REPOST,
        handler: (_e: string, trackId: string) => {
          if (trackId) {
            dispatch(toggleRepost(+trackId, false)); // TODO determine if track or playlist
          }
        }
      });

      listeners.push({
        event: EVENTS.APP.SEND_NOTIFICATION,
        handler: (_e: string, contents: { title: string; message: string; image: string }) => {
          const myNotification = new Notification(contents.title, {
            body: contents.message,
            icon: contents.image,
            silent: true
          });

          myNotification.onclick = () => {
            ipcRenderer.send(EVENTS.APP.RAISE);
          };
        }
      });

      listeners.forEach(l => {
        if (is.renderer()) {
          ipcRenderer.on(l.event, l.handler);
        }
      });
    }
  };
}

export function stopWatchers(): void {
  listeners.forEach(l => {
    ipcRenderer.removeListener(l.event, l.handler);
  });

  listeners = [];
}

export function initApp(): ThunkResult<void> {
  return (dispatch, getState) => {
    const {
      config: {
        auth: { token }
      }
    } = getState();

    if (!token) {
      dispatch(replace('/login'));

      return Promise.resolve();
    }

    SC.initialize(token);

    dispatch(initWatchers());

    if (process.env.NODE_ENV === 'development') {
      dispatch(action(AppActionTypes.RESET_STORE));
    }

    return dispatch(
      action(
        AppActionTypes.SET_LOADED,
        Promise.all([
          dispatch(getAuth()),
          dispatch(getAuthFollowings()),
          dispatch(getAuthReposts()),

          dispatch(getAuthFeed()),
          dispatch(getAuthLikesIfNeeded()),
          dispatch(getAuthLikeIds()),
          dispatch(getAuthPlaylists()),
          dispatch(getRemainingPlays())
        ]).then(() => {
          setInterval(() => dispatch(getRemainingPlays()), 30000);
        })
      )
    );
  };
}

export function resolveUrl(url: string): ThunkResult<void> {
  return dispatch => {
    fetchToJson<SoundCloud.Asset<any>>(SC.resolveUrl(url))
      .then(json => {
        switch (json.kind) {
          case 'track':
            return dispatch(replace(`/track/${json.id}`));
          case 'playlist':
            return dispatch(replace(`/playlist/${json.id}`));
          case 'user':
            return dispatch(replace(`/user/${json.id}`));
          default:
            // eslint-disable-next-line no-console
            console.error('Resolve not implemented for', json.kind);
            return null;
        }
      })
      .catch(() => {
        dispatch(goBack());
        IPC.openExternal(unescape(url));
      });
  };
}
