export const EVENTS = {
  CHROMECAST: {
    DISCOVER: 'chromecast/discover'
  },
  PLAYER: {
    SEEK: 'player/action/seek',
    SEEK_END: 'player/action/seek_end'
  },
  TRACK: {
    LIKED: 'track/liked',
    REPOSTED: 'track/reposted',
    LIKE: 'track/action/like',
    REPOST: 'track/action/repost'
  },
  APP: {
    SEND_NOTIFICATION: 'app/send_notification',
    NAVIGATE: 'app/navigate',
    PUSH_NAVIGATION: 'app/pus-navigation',
    UPDATE: 'app/update',
    READY: 'app/ready',
    RESTART: 'app/restart',
    RELOAD: 'app/reload',
    VALID_DIR: 'app/valid_dir',
    VALID_DIR_RESPONSE: 'app/valid_dir/response',
    OPEN_EXTERNAL: 'app/open_external',
    WRITE_CLIPBOARD: 'app/write_clipboard',
    DOWNLOAD_FILE: 'app/download_file',
    RAISE: 'app/raise',
    AUTH: {
      LOGIN: 'app/auth/login',
      REFRESH: 'app/auth/refresh'
    },
    LASTFM: {
      AUTH: 'app/lastfm/auth'
    }
  }
};
