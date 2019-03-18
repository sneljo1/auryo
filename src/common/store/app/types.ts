// TYPES

export interface AppState extends Readonly<{
    history: CanGoHistory;
    loaded: boolean;
    loading_error: string | null;
    offline: boolean;
    update: UpdateInfo;
    last_checked: number;
    dimensions: Dimensions;
    remainingPlays: RemainingPlays | null;
    lastfmLoading: boolean;
    chromecast: ChromeCastState;
}> { }

export interface MDNSAddress {
    port: number;
    host: string;
}

export interface ChromeCastDevice {
    id: string;
    name: string;
    address: MDNSAddress;
    groups: Array<string>;
}

export interface ChromeCastState {
    hasDevices: boolean;
    devices: Array<ChromeCastDevice>;
    groups: Array<ChromeCastDevice>;
    selectedDeviceId: string | null;
    devicePlayerStatus: DevicePlayerStatus | null;
}

export enum DevicePlayerStatus {
    IDLE = 'IDLE',
    BUFFERING = 'BUFFERING',
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',

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

export const enum AppActionTypes {
    TOGGLE_OFFLINE = '@@app/TOGGLE_OFFLINE',
    SET_LOADED = '@@app/SET_LOADED',
    SET_DIMENSIONS = '@@app/SET_DIMENSIONS',
    SET_UPDATE_AVAILABLE = '@@app/SET_UPDATE_AVAILABLE',
    SET_CAN_GO = '@@app/SET_CAN_GO',
    RESET_STORE = '@@app/RESET_STORE',
    SET_REMAINING_PLAYS = '@@app/SET_REMAINING_PLAYS',
    SET_LASTFM_LOADING = '@@app/SET_LASTFM_LOADING',
    SET_AVAILABLE_CHROMECAST_DEVICES = '@@app/SET_AVAILABLE_CHROMECAST_DEVICES',
    SET_CHROMECAST_DEVICE = '@@app/SET_CHROMECAST_DEVICE',
    SET_CHROMECAST_PLAYER_STATUS = '@@app/SET_CHROMECAST_PLAYER_STATUS',
}
