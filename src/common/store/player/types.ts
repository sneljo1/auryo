// TYPES

export interface PlayerState extends Readonly<{
    status: PlayerStatus;
    queue: Array<PlayingTrack>;
    originalQueue: Array<PlayingTrack>;
    playingTrack: PlayingTrack | null;
    currentPlaylistId: string | null;
    currentIndex: number;
    currentTime: number;
    duration: number;
    upNext: UpNextState,
    containsPlaylists: Array<PlayingPositionState>
}> { }

export interface PlayingTrack {
    un: number; // unique identifiable number to differentiate between the same tracks in queue
    id: number;
    playlistId: string;
}

export interface PlayingPositionState {
    id: number;
    start: number;
    end: number;
}

export interface UpNextState {
    start: number;
    length: number;
}

export enum PlayerStatus {
    STOPPED = 'STOPPED',
    PAUSED = 'PAUSED',
    PLAYING = 'PLAYING',
}

export enum ChangeTypes {
    NEXT = 'NEXT',
    PREV = 'PREV',
}

export enum RepeatTypes {
    ONE = 'ONE',
    ALL = 'ALL',
}
export enum VolumeChangeTypes {
    UP = 'UP',
    DOWN = 'DOWN',
}

// ACTIONS

export const enum PlayerActionTypes {
    SET_TIME = '@@player/SET_TIME',
    UPDATE_TIME = '@@player/UPDATE_TIME',
    SET_DURATION = '@@player/SET_DURATION',
    SET_TRACK = '@@player/SET_TRACK',
    TOGGLE_PLAYING = '@@player/TOGGLE_PLAYING',
    SET_PLAYLIST = '@@player/SET_PLAYLIST',
    QUEUE_INSERT = '@@player/QUEUE_INSERT',
    ADD_UP_NEXT = '@@player/ADD_UP_NEXT',
    CLEAR_UP_NEXT = '@@player/CLEAR_UP_NEXT',
    TOGGLE_SHUFFLE = '@@player/TOGGLE_SHUFFLE',
}
