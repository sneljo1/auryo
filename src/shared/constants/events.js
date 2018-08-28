export const EVENTS = {
    PLAYER: {
        TRACK_CHANGED: 'player/track_changed',
        STATUS_CHANGED: 'player/status_changed',

        CHANGE_TRACK: 'player/action/change_track',
        SEEK: 'player/action/seek',
        TOGGLE_STATUS: 'player/action/toggle_status',
        CHANGE_VOLUME: 'player/action/change_volume'
    },
    TRACK: {
        LIKED: 'track/liked',
        REPOSTED: 'track/reposted',
        LIKE: 'track/action/like',
        REPOST: 'track/action/repost'
    },
    APP: {
        UPDATE: 'app/update',
        STREAM_ERROR: 'app/stream/error',
        STREAMED: 'app/stream',
        UPDATE_AVAILABLE: 'app/update/available',
        READY: 'app/ready',
        RESTART: 'app/restart',
        VALID_DIR: 'app/valid_dir',
        VALID_DIR_RESPONSE: 'app/valid_dir/response',
        OPEN_SETTINGS: 'app/open_settings',
        OPEN_EXTERNAL: 'app/open_external',
        WRITE_CLIPBOARD: 'app/write_clipboard',
        DOWNLOAD_FILE: 'app/download_file',
        AUTH: {
            LOGIN: 'app/auth/login'
        }
    }
};