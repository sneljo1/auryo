import { wError, wSuccess } from '@common/utils/reduxUtils';
import { EpicFailure } from '@types';
import { action, createAction, createAsyncAction } from 'typesafe-actions';
import { AppActionTypes, CastAppState, ChromeCastDevice, DevicePlayerStatus, RemainingPlays } from '../types';

export const resetStore = createAction(AppActionTypes.RESET_STORE)();
export const copyToClipboard = createAction(AppActionTypes.COPY_TO_CLIPBOARD)<string>();
export const openExternalUrl = createAction(AppActionTypes.OPEN_EXTERNAL_URL)<string>();
export const restartApp = createAction(AppActionTypes.RESTART_APP)();
export const initApp = createAction(AppActionTypes.INIT)<{ access_token: string }>();
export const receiveProtocolAction = createAction(AppActionTypes.RECEIVE_PROTOCOL_ACTION)<{
  action: string;
  params: Record<string, unknown>;
}>();

export const getRemainingPlays = createAsyncAction(
  String(AppActionTypes.GET_REMAINING_PLAYS),
  wSuccess(AppActionTypes.GET_REMAINING_PLAYS),
  wError(AppActionTypes.GET_REMAINING_PLAYS)
)<undefined, RemainingPlays | null, EpicFailure>();

export const connectLastFm = createAsyncAction(
  String(AppActionTypes.CONNECT_LAST_FM),
  wSuccess(AppActionTypes.CONNECT_LAST_FM),
  wError(AppActionTypes.CONNECT_LAST_FM)
)<undefined, any, EpicFailure>();

export const resolveSoundCloudUrl = createAction(AppActionTypes.RESOLVE_SOUNDCLOUD_URL)<string>();

export const toggleOffline = createAction(AppActionTypes.TOGGLE_OFFLINE, (offline: boolean) => ({
  time: new Date().getTime(),
  offline
}))();

// ----

export const setLastfmLoading = (loading: boolean) => action(AppActionTypes.SET_LASTFM_LOADING, loading);
export const addChromeCastDevice = (device: ChromeCastDevice) =>
  action(AppActionTypes.ADD_CHROMECAST_DEVICE, {
    device
  });
export const removeChromeCastDevice = (deviceId: string) =>
  action(AppActionTypes.REMOVE_CHROMECAST_DEVICE, {
    deviceId
  });
export const setChromecastDevice = (deviceId?: string) => action(AppActionTypes.SET_CHROMECAST_DEVICE, deviceId);
export const setChromeCastPlayerStatus = (playerStatus: DevicePlayerStatus) =>
  action(AppActionTypes.SET_CHROMECAST_PLAYER_STATUS, playerStatus);
export const setChromecastAppState = (state: CastAppState | null) =>
  action(AppActionTypes.SET_CHROMECAST_APP_STATE, state);

export const setUpdateAvailable = (version: string) =>
  action(AppActionTypes.SET_UPDATE_AVAILABLE, {
    version
  });
