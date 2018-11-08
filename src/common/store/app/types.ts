// TYPES

export interface AppState extends Readonly<{
    history: CanGoHistory
    loaded: boolean
    loading_error: string | null
    offline: boolean
    update: UpdateInfo
    last_checked: number
    dimensions: Dimensions
    remainingPlays: RemainingPlays | null
}> { }

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
}
