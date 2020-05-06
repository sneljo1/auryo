import { ThemeKeys } from '@renderer/app/components/Theme/themes';

const app = require('electron').app || require('electron').remote.app; // eslint-disable-line

const BASE_URL = 'https://api.auryo.com';

const downloadPath = app.getPath('downloads');

export const CONFIG = {
  // SoundCloud
  BASE_URL,
  CLIENT_ID: process.env.CLIENT_ID,
  SENTRY_REPORT_URL: process.env.SENTRY_REPORT_URL as string,
  FB_APP_ID: process.env.FB_APP_ID,

  // Google

  GOOGLE_GA: process.env.GOOGLE_GA as string,

  // App

  MAIN_WINDOW: `file://${__dirname}/renderer/app.html`,
  STREAM_CHECK_INTERVAL: 60000,
  UPDATE_SERVER_HOST: 'https://api.github.com/repos/Superjo149/Auryo/releases/latest',

  // LastFM

  LASTFM_API_KEY: process.env.LASTFM_API_KEY,
  LASTFM_API_SECRET: process.env.LASTFM_API_SECRET,

  // Auth
  AWS_API_URL: 'https://auth-api.auryo.com',

  // Config

  DEFAULT_CONFIG: {
    updatedAt: 0,
    lastLogin: null,
    auth: {
      refreshToken: null,
      expiresAt: null,
      token: process.env.TOKEN ? process.env.TOKEN : null
    },
    audio: {
      volume: 0.5,
      playbackDeviceId: null,
      muted: false
    },
    repeat: null,
    shuffle: false,
    version: app.getVersion(),
    hideReposts: false,
    enableProxy: false,
    proxy: {
      host: undefined,
      port: undefined,
      username: undefined,
      password: undefined
    },
    app: {
      analytics: false,
      crashReports: true,
      theme: ThemeKeys.darkBlue,
      downloadPath,
      showTrackChangeNotification: true,
      logTrackChange: false,
      overrideClientId: null
    }
  }
};
