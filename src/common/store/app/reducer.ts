import { Reducer } from "redux";
import { onError, onSuccess } from "../../utils/reduxUtils";
import { AppActionTypes, AppState } from "./types";

const initialState: AppState = {
    history: {
        back: false,
        next: false
    },
    loaded: false,
    loading_error: null,
    offline: false,
    update: {
        available: false,
        version: null
    },
    last_checked: 0,
    dimensions: {
        width: 0,
        height: 0
    },
    remainingPlays: null,
    lastfmLoading: false,
    chromecast: {
        hasDevices: false,
        devices: [],
        selectedDeviceId: null,
        devicePlayerStatus: null,
        castApp: null
    }
};

export const appReducer: Reducer<AppState> = (state = initialState, action) => {
    const { payload, type } = action;

    switch (type) {
        case AppActionTypes.SET_CAN_GO:
            return {
                ...state,
                history: {
                    ...state.history,
                    next: payload.next,
                    back: payload.back
                }
            };
        case onSuccess(AppActionTypes.SET_REMAINING_PLAYS):
            return {
                ...state,
                remainingPlays: {
                    ...payload,
                    updatedAt: Date.now()
                }
            };
        case AppActionTypes.TOGGLE_OFFLINE:
            return {
                ...state,
                offline: payload.offline,
                last_checked: payload.time
            };

        case onError(AppActionTypes.SET_LOADED):
            return {
                ...state,
                loading_error: payload.message
            };
        case onSuccess(AppActionTypes.SET_LOADED):
            return {
                ...state,
                loaded: true,
                loading_error: null
            };
        case AppActionTypes.SET_DIMENSIONS:
            return {
                ...state,
                dimensions: payload
            };
        case AppActionTypes.SET_LASTFM_LOADING:
            return {
                ...state,
                lastfmLoading: payload
            };
        case AppActionTypes.SET_UPDATE_AVAILABLE:
            return {
                ...state,
                update: {
                    ...state.update,
                    available: true,
                    version: payload.version
                }
            };
        case AppActionTypes.SET_AVAILABLE_CHROMECAST_DEVICES:
            return {
                ...state,
                chromecast: {
                    ...state.chromecast,
                    devices: payload.devices,
                    hasDevices: payload.devices.length
                }
            };
        case AppActionTypes.SET_CHROMECAST_APP_STATE:
            return {
                ...state,
                chromecast: {
                    ...state.chromecast,
                    castApp: payload
                }
            };
        case AppActionTypes.SET_CHROMECAST_DEVICE:
            return {
                ...state,
                chromecast: {
                    ...state.chromecast,
                    selectedDeviceId: payload
                }
            };
        case AppActionTypes.SET_CHROMECAST_PLAYER_STATUS:
            return {
                ...state,
                chromecast: {
                    ...state.chromecast,
                    devicePlayerStatus: payload
                }
            };
        case AppActionTypes.RESET_STORE:
            return initialState;
        default:
            return state;
    }

};
