// TYPES

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AppState
  extends Readonly<{
    history: CanGoHistory;
    error: boolean;
    loaded: boolean;
    loadingError: string | null;
    offline: boolean;
    update: UpdateInfo;
    lastChecked: number;
    dimensions: Dimensions;
    remainingPlays: RemainingPlays | null;
    lastfmLoading: boolean;
    chromecast: ChromeCastState;
  }> {}

export const DEVICE_MODELS = {
  Group: 'Google Cast Group' as 'Google Cast Group',
  Home: 'Google Home' as 'Google Home',
  HomeMini: 'Google Home Mini' as 'Google Home Mini',
  MagniFiMini: 'MagniFi Mini' as 'MagniFi Mini',
  Chromecast: 'Chromecast' as 'Chromecast'
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

export interface CanGoHistory {
  back: boolean;
  next: boolean;
}
export interface UpdateInfo {
  available: boolean;
  version: string | null;
}
export interface Dimensions {
  width: number;
  height: number;
}

// ACTIONS

export enum AppActionTypes {
  TOGGLE_OFFLINE = '@@app/TOGGLE_OFFLINE',
  SET_LOADED = '@@app/SET_LOADED',
  SET_DIMENSIONS = '@@app/SET_DIMENSIONS',
  SET_UPDATE_AVAILABLE = '@@app/SET_UPDATE_AVAILABLE',
  SET_CAN_GO = '@@app/SET_CAN_GO',
  RESET_STORE = '@@app/RESET_STORE',
  SET_REMAINING_PLAYS = '@@app/SET_REMAINING_PLAYS',
  SET_LASTFM_LOADING = '@@app/SET_LASTFM_LOADING',
  ADD_CHROMECAST_DEVICE = '@@app/ADD_CHROMECAST_DEVICE',
  REMOVE_CHROMECAST_DEVICE = '@@app/REMOVE_CHROMECAST_DEVICE',
  SET_CHROMECAST_DEVICE = '@@app/SET_CHROMECAST_DEVICE',
  SET_CHROMECAST_PLAYER_STATUS = '@@app/SET_CHROMECAST_PLAYER_STATUS',
  SET_CHROMECAST_APP_STATE = '@@app/SET_CHROMECAST_APP_STATE'
}
