import * as is from 'electron-is';

const app = require('electron').app || require('electron').remote.app; // eslint-disable-line

const BASE_URL = 'https://api.auryo.com';

let downloadPath = '';

if (!is.renderer()) {
    // eslint-disable-next-line
    const { app } = require('electron');
    downloadPath = app.getPath('downloads');
}

export const CONFIG = {
    // SoundCloud
    BASE_URL,
    CLIENT_ID: process.env.CLIENT_ID,
    SENTRY_REPORT_URL: process.env.SENTRY_REPORT_URL as string,
    FB_APP_ID: process.env.FB_APP_ID,

    getConnectUrl: (socketID: string) => `${BASE_URL}/connect?state=${socketID}&env=${process.env.NODE_ENV}`,

    // Google

    GOOGLE_GA: process.env.GOOGLE_GA as string,

    // App

    MAIN_WINDOW: `file://${__dirname}/renderer/app.html`,
    STREAM_CHECK_INTERVAL: 60000,
    UPDATE_SERVER_HOST: 'https://api.github.com/repos/Superjo149/Auryo/releases/latest',

    // Config

    DEFAULT_CONFIG: {
        updatedAt: 0,
        lastLogin: null,
        token: process.env.TOKEN ? process.env.TOKEN : null,
        volume: .5,
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
            downloadPath,
            showTrackChangeNotification: true
        }
    }
};
