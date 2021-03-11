// TYPES

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AppState
  extends Readonly<{
    error: boolean;
    loaded: boolean;
    loadingError: string | null;
    offline: boolean;
    update: UpdateInfo;
    lastChecked: number;
    remainingPlays: RemainingPlays | null;
    lastfmLoading: boolean;
    chromecast: ChromeCastState;
  }> {}

export const DEVICE_MODELS = {
  Group: 'Google Cast Group' as const,
  Home: 'Google Home' as const,
  HomeMini: 'Google Home Mini' as const,
  MagniFiMini: 'MagniFi Mini' as const,
  Chromecast: 'Chromecast' as const
};

// TODO: add more valid models as they're found
export type GoogleDeviceModel = 'Google Cast Group' | 'Google Home' | 'Google Home Mini' | 'MagniFi Mini';

export interface ChromeCastDevice {
  id: string;
  name: string;
  model: GoogleDeviceModel;
  address: string;
  port: number;
  status: 'offline' | 'searching' | 'online';
}

export interface ChromeCastState {
  hasDevices: boolean;
  devices: ChromeCastDevice[];
  selectedDeviceId: string | null;
  devicePlayerStatus: DevicePlayerStatus | null;
  castApp: CastAppState | null;
}

export interface CastAppState {
  appId: string;
  displayName: string;
  launchedFromCloud: boolean;
  sessionId: string;
  transportId: string;
}

export enum DevicePlayerStatus {
  IDLE = 'IDLE',
  BUFFERING = 'BUFFERING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED'
}
export interface RemainingPlays {
  remaining: number;
  resetTime: number;
  updatedAt?: number;
}
export interface UpdateInfo {
  available: boolean;
  version: string | null;
}

// ACTIONS

export enum AppActionTypes {
  GET_REMAINING_PLAYS = 'auryo.app.GET_REMAINING_PLAYS',
  RESET_STORE = 'auryo.app.RESET_STORE',
  COPY_TO_CLIPBOARD = 'auryo.app.COPY_TO_CLIPBOARD',
  OPEN_EXTERNAL_URL = 'auryo.app.OPEN_EXTERNAL_URL',
  RESTART_APP = 'auryo.app.RESTART_APP',
  INIT = 'auryo.app.INIT',
  RECEIVE_PROTOCOL_ACTION = 'auryo.app.RECEIVE_PROTOCOL_ACTION',
  CONNECT_LAST_FM = 'auryo.app.CONNECT_LAST_FM',
  RESOLVE_SOUNDCLOUD_URL = 'auryo.app.RESOLVE_SOUNDCLOUD_URL',

  TOGGLE_OFFLINE = 'auryo.app.TOGGLE_OFFLINE',
  SET_LOADED = 'auryo.app.SET_LOADED',
  SET_UPDATE_AVAILABLE = 'auryo.app.SET_UPDATE_AVAILABLE',
  SET_REMAINING_PLAYS = 'auryo.app.SET_REMAINING_PLAYS',
  SET_LASTFM_LOADING = 'auryo.app.SET_LASTFM_LOADING',
  ADD_CHROMECAST_DEVICE = 'auryo.app.ADD_CHROMECAST_DEVICE',
  REMOVE_CHROMECAST_DEVICE = 'auryo.app.REMOVE_CHROMECAST_DEVICE',
  SET_CHROMECAST_DEVICE = 'auryo.app.SET_CHROMECAST_DEVICE',
  SET_CHROMECAST_PLAYER_STATUS = 'auryo.app.SET_CHROMECAST_PLAYER_STATUS',
  SET_CHROMECAST_APP_STATE = 'auryo.app.SET_CHROMECAST_APP_STATE'
}
