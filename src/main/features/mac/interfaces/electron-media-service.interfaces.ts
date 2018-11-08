export enum MediaStates {
    STOPPED = 'stopped',
    PLAYING = 'playing',
    PAUSED = 'paused'
}

export interface MetaData {
    state: MediaStates;
    id?: number;
    title?: string;
    artist?: string;
    albumArt?: string;
    album?: string;
    currentTime?: milliseconds;
    duration?: milliseconds;
}

export interface MediaService {
    setMetaData(metadata: MetaData): void;
    isStarted(): boolean;
    startService(): void;
    stopService(): void;
}

export type milliseconds = number;
