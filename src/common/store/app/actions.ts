import { wError, wSuccess } from '@common/utils/reduxUtils';
import { EpicFailure } from '@types';
import { action, createAction, createAsyncAction } from 'typesafe-actions';
import { AppActionTypes, CastAppState, ChromeCastDevice, DevicePlayerStatus, RemainingPlays } from '../types';

export const resetStore = createAction(AppActionTypes.RESET_STORE)();
export const copyToClipboard = createAction(AppActionTypes.COPY_TO_CLIPBOARD)<string>();
export const openExternalUrl = createAction(AppActionTypes.OPEN_EXTERNAL_URL)<string>();
export const restartApp = createAction(AppActionTypes.RESTART_APP)();
export const initApp = createAction(AppActionTypes.INIT)();
export const receiveProtocolAction = createAction(AppActionTypes.RECEIVE_PROTOCOL_ACTION)<{
  action: string;
  params: Record<string, unknown>;
}>();

export const getRemainingPlays = createAsyncAction(
  String(AppActionTypes.GET_REMAINING_PLAYS),
  wSuccess(AppActionTypes.GET_REMAINING_PLAYS),
  wError(AppActionTypes.GET_REMAINING_PLAYS)
)<undefined, RemainingPlays | null, EpicFailure>();

// ======
// export function tryAndResolveQueryAsSoundCloudUrl(query: string, dispatch: Dispatch) {
//   if (isSoundCloudUrl(query)) {
//     dispatch(resolveUrl(query) as any);
//   }
// }

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

export const toggleOffline = (offline: boolean) =>
  action(AppActionTypes.TOGGLE_OFFLINE, {
    time: new Date().getTime(),
    offline
  });
export const setUpdateAvailable = (version: string) =>
  action(AppActionTypes.SET_UPDATE_AVAILABLE, {
    version
  });

const listeners: any[] = [];

// export function initWatchers(): ThunkResult<any> {
//   // tslint:disable-next-line: max-func-body-length
//   return dispatch => {
//     if (!listeners.length) {

//       listeners.push({
//         event: EVENTS.APP.SEND_NOTIFICATION,
//         handler: (_e: string, contents: { title: string; message: string; image: string }) => {
//           const myNotification = new Notification(contents.title, {
//             body: contents.message,
//             icon: contents.image,
//             silent: true
//           });

//           myNotification.onclick = () => {
//             ipcRenderer.send(EVENTS.APP.RAISE);
//           };
//         }
//       });

//       listeners.forEach(l => {
//         if (is.renderer()) {
//           ipcRenderer.on(l.event, l.handler);
//         }
//       });
//     }
//   };
// }

// export function stopWatchers(): void {
//   listeners.forEach(l => {
//     ipcRenderer.removeListener(l.event, l.handler);
//   });

//   listeners = [];
// }

// export function initApp(): ThunkResult<void> {
//   return (dispatch, getState) => {
//     const {
//       config: {
//         auth: { token }
//       }
//     } = getState();

//     if (!token) {
//       dispatch(replace('/login'));

//       return Promise.resolve();
//     }

//     SC.initialize(token);

//     dispatch(initWatchers());

//     if (process.env.NODE_ENV === 'development') {
//       dispatch(action(AppActionTypes.RESET_STORE));
//     }

//     return dispatch(
//       action(
//         AppActionTypes.SET_LOADED,
//         Promise.all([
//           dispatch(getAuth()),
//           dispatch(getAuthFollowings()),
//           dispatch(getAuthReposts()),

//           dispatch(getAuthFeed()),
//           dispatch(getAuthLikesIfNeeded()),
//           dispatch(getAuthLikeIds()),
//           dispatch(getAuthPlaylists()),
//           dispatch(getRemainingPlays())
//         ]).then(() => {
//           setInterval(() => dispatch(getRemainingPlays()), 30000);
//         })
//       )
//     );
//   };
// }

// export function resolveUrl(url: string): ThunkResult<void> {
//   return dispatch => {
//     fetchToJson<SoundCloud.Asset<any>>(SC.resolveUrl(url))
//       .then(json => {
//         switch (json.kind) {
//           case 'track':
//             return dispatch(replace(`/track/${json.id}`));
//           case 'playlist':
//             return dispatch(replace(`/playlist/${json.id}`));
//           case 'user':
//             return dispatch(replace(`/user/${json.id}`));
//           default:
//             // eslint-disable-next-line no-console
//             console.error('Resolve not implemented for', json.kind);
//             return null;
//         }
//       })
//       .catch(() => {
//         dispatch(goBack());
//         IPC.openExternal(unescape(url));
//       });
//   };
// }
