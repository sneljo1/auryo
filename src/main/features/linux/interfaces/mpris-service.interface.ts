export namespace MprisServiceClient {
  export interface MetaData {
    'xesam:title'?: string
    'mpris:trackId'?: string
    'mpris:artUrl'?: string
    'mpris:length'?: microseconds
    'xesam:artist'?: Array<string>
    'xesam:asText'?: string
    'xesam:audioBPM'?: number
    'xesam:autoRating'?: number
    'xesam:comment'?: Array<number>
    'xesam:composer'?: Array<string>
    'xesam:url'?: string
    'xesam:lastUsed'?: ISOString
    'xesam:genre'?: Array<string>
    'xesam:contentCreated'?: ISOString
    'xesam:useCount'?: number
  }

  export interface PlayerOptions {
    name: string
    identity: string
    supportedUriSchemes: Array<string>
    supportedMimeTypes: Array<string>
    supportedInterfaces: Array<string>
  }

  export type double = number;
  export type ISOString = string;

  export interface Player {
    playbackStatus: 'Stopped' | 'Playing' | 'Paused';
    loopStatus: 'None';
    rate: double;
    shuffle: boolean;
    metadata: MetaData;
    volume: double;
    position: number;
    minimumRate: double;
    maximumRate: double;
    canGoNext: boolean;
    canGoPrevious: boolean;
    canPlay: boolean;
    canPause: boolean;
    canSeek: boolean;
    canControl: boolean;
    canEditTracks: boolean;

    constructor(options: PlayerOptions): void;

    seeked(delta: double): void;
    objectPath(trackId: string): string;

    on(event: 'next' | 'previous' | 'pause' | 'playpause' | 'stop' | 'play' | 'raise' | 'quit', callback: Function): void;

    on(event: 'seek', data: { delta: number; position: number }): void;
    on(event: 'position', data: { trackId: string; position: number }): void;
    on(event: 'open', data: { trackId: string; position: number }): void;
  }

  export type microseconds = number;
}
