export const EVENTS = {
    PLAYER: {
        TRACK_CHANGED: "player/track_changed",
        STATUS_CHANGED: "player/status_changed",

        CHANGE_TRACK: "player/action/change_track",
        SEEK: "player/action/seek",
        TOGGLE_STATUS: "player/action/toggle_status",
        CHANGE_VOLUME: "player/action/change_volume",
    },
    TRACK: {
        LIKED: "track/liked",
        REPOSTED: "track/reposted",
        LIKE: "track/action/like",
        REPOST: "track/action/repost",
    },
    APP: {
        SEND_NOTIFICATION: "app/send_notification",
        NAVIGATE: "app/navigate",
        PUSH_NAVIGATION: "app/pus-navigation",
        UPDATE: "app/update",
        READY: "app/ready",
        RESTART: "app/restart",
        VALID_DIR: "app/valid_dir",
        VALID_DIR_RESPONSE: "app/valid_dir/response",
        OPEN_EXTERNAL: "app/open_external",
        WRITE_CLIPBOARD: "app/write_clipboard",
        DOWNLOAD_FILE: "app/download_file",
        RAISE: "app/raise",
        AUTH: {
            LOGIN: "app/auth/login",
        },
    },
};
