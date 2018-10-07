import { ThunkAction } from 'redux-thunk';
import { StoreState } from './common/store';

export type ThunkResult<R> = ThunkAction<R, StoreState, undefined, any>;

export interface GetPlaylistOptions {
    refresh?: boolean;
    appendId?: number | null;
}

export interface NormalizedResult { schema: 'users' | 'tracks' | 'playlists' | 'comments'; id: number; }

export interface NormalizedResponse {
    entities: NormalizedEntities;
    result: Array<NormalizedResult>;
}

export interface NormalizedEntities {
    playlistEntities?: {
        [playlistId: string]: Normalized.Playlist
    };
    trackEntities?: {
        [trackId: string]: Normalized.Track
    };
    userEntities?: {
        [trackId: string]: SoundCloud.User
    };
    commentEntities?: {
        [commentId: string]: SoundCloud.Comment
    };
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// tslint:disable-next-line:no-namespace
export namespace Normalized {
    export interface Playlist extends Omit<SoundCloud.Playlist, 'tracks' | 'user'> {
        tracks: Array<NormalizedResult>;
        user: number;
    }

    export interface Track extends Omit<SoundCloud.Track, 'user'> {
        user: number;
    }
}

// tslint:disable-next-line:no-namespace
export namespace SoundCloud {
    export type DateString = string;

    export interface Asset<T> {
        id: number;
        kind: T;
        uri: string;

        // Local addition for checking if there's already one of these assets being loaded
        loading?: boolean;
    }

    export enum AssetType {
        USER = 'user',
        COMMENT = 'comment',
        TRACK = 'track',
        PLAYLIST = 'playlist',
        WEBPROFILE = 'web-profile',
    }

    export enum ProfileService {
        SOUNDCLOUD = 'soundcloud',
        INSTAGRAM = 'instagram',
        FACEBOOK = 'facebook',
        TWITTER = 'twitter',
        YOUTUBE = 'youtube',
        SPOTIFY = 'spotify',
        TUMBLR = 'tumblr',
        PINTEREST = 'pinterest',
        SNAPCHAT = 'snapchat',
        PERSONAL = 'personal',
        SONGKICK = 'songkick',
        BEATPORT = 'beatport'
    }

    export interface Profile extends Asset<AssetType.WEBPROFILE> {
        created_at: DateString;
        service: ProfileService;
        title: string;
        url: string;
        username: string;
    }

    export interface Subscription {
    }

    export interface Comment extends Asset<AssetType.COMMENT> {
        created_at: DateString;
        user_id: number;
        track_id: number;
        timestamp: number;
        body: string;
        user: CompactUser;
    }

    export interface CompactUser extends Asset<AssetType.USER> {
        permalink: string;
        username: string;
        last_modified: string;
        permalink_url: string;
        avatar_url: string;
    }

    export interface User extends Asset<AssetType.USER> {
        permalink: string;
        username: string;
        last_modified: string;
        permalink_url: string;
        avatar_url: string;
        country?: any;
        first_name: string;
        last_name: string;
        full_name: string;
        description?: any;
        city?: any;
        discogs_name?: any;
        myspace_name?: any;
        website?: any;
        website_title?: any;
        track_count: number;
        playlist_count: number;
        online: boolean;
        plan: string;
        public_favorites_count: number;
        followers_count: number;
        followings_count: number;
        subscriptions: Array<any>;
        upload_seconds_left: number;
        quota: Quota;
        private_tracks_count: number;
        private_playlists_count: number;
        primary_email_confirmed: boolean;
        locale: string;
        reposts_count: number;

        profiles?: UserProfiles;
    }

    export interface UserProfiles {
        items: Array<Profile>;
        loading: boolean;
    }

    export interface Track extends Asset<AssetType.TRACK> {
        created_at: string;
        user_id: number;
        duration: number;
        commentable: boolean;
        state: string;
        original_content_size: number;
        last_modified: string;
        sharing: string;
        tag_list: string;
        permalink: string;
        streamable: boolean;
        embeddable_by: string;
        purchase_url: string;
        purchase_title: string;
        label_id?: any;
        genre: string;
        title: string;
        description: string;
        label_name: string;
        release?: any;
        track_type?: any;
        key_signature?: any;
        isrc: string;
        video_url?: any;
        bpm?: any;
        release_year: number;
        release_month: number;
        release_day: number;
        original_format: string;
        license: string;
        user: CompactUser;
        permalink_url: string;
        artwork_url: string;
        stream_url: string;
        download_url: string;
        playback_count: number;
        download_count: number;
        likes_count: number;
        reposts_count: number;
        comment_count: number;
        downloadable: boolean;
        waveform_url: string;
        attachments_uri: string;

        // Will only be added to items fetched by charts
        score?: number;

        policy?: any;

        // Will only be added to items fetched by stream
        from_user?: CompactUser;

        error?: any;
    }

    export interface Playlist extends Asset<AssetType.PLAYLIST> {
        duration: number;
        release_day?: any;
        permalink_url: string;
        genre?: any;
        permalink: string;
        purchase_url?: any;
        release_month?: any;
        description?: any;
        label_name?: any;
        tag_list: string;
        release_year?: any;
        secret_uri: string;
        track_count: number;
        user_id: number;
        last_modified: string;
        license: string;
        tracks: Array<Track>;
        playlist_type?: any;
        downloadable: boolean;
        sharing: string;
        secret_token: string;
        created_at: string;
        release?: any;
        title: string;
        type?: any;
        purchase_title?: any;
        artwork_url?: any;
        ean?: any;
        streamable: boolean;
        user: CompactUser;
        embeddable_by: string;
        label_id?: any;
        likes_count: number;
        reposts_count: number;

        // Will only be added to items fetched by stream
        from_user?: CompactUser;

        policy?: any;
    }

    export interface Quota {
        unlimited_upload_quota: boolean;
        upload_seconds_used: number;
        upload_seconds_left: number;
    }

    export type Music = Playlist | Track;

    export type All = Playlist | Track | User;
}

export enum REDUX_STATES {
    LOADING = 'LOADING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}
