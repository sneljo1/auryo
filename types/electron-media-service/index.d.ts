declare module "electron-media-service" {
    import { EventEmitter } from "events";

    enum MediaStates {
        STOPPED = "stopped",
        PLAYING = "playing",
        PAUSED = "paused"
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

    export default class MediaService extends EventEmitter {
        setMetaData(metadata: MetaData): void;
        isStarted(): boolean;
        startService(): void;
        stopService(): void;
    }

    export type milliseconds = number;

}