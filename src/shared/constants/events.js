export const EVENTS = {
    PLAYER: {
        TRACK_CHANGED: 'player::track_changed',
        STATUS_CHANGED: 'player::status_changed',

        CHANGE_TRACK: 'player::action::change_track',
        TOGGLE_STATUS: 'player::action::toggle_status',
        CHANGE_VOLUME: 'player::action::change_volume'
    },
    TRACK: {
        LIKED: 'track::liked',
        REPOSTED: 'track::reposted',
        LIKE: 'track::action::like',
        REPOST: 'track::action::repost'
    },
    APP: {
        UPDATE: 'app::do_update',
        READY: 'app::ready',
        RESTART: 'app::restart',
        VALID_DIR: 'app::valid_dir',
        OPEN_SETTINGS: 'app::open_settings',
    }
};