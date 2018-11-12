import { RepeatTypes } from '../player';

// TYPES

export interface Config extends Object {
    updatedAt: number;
    token: string | null;
    volume: number;
    repeat: RepeatTypes | null;
    shuffle: boolean;
    version: string;
    hideReposts: boolean;
    enableProxy: boolean;
    proxy: ProxyConfig;
    app: AppConfig;
    lastLogin: number | null;
}

export interface ConfigState extends Readonly<Config> { }

export interface AppConfig {
    analytics: boolean;
    crashReports: boolean;
    downloadPath: string;
    showTrackChangeNotification: boolean;
}

export interface ProxyConfig {
    host?: string | null;
    port?: number;
    username?: string;
    password?: string;
}

// ACTIONS

export const enum ConfigActionTypes {
    SET_TOKEN = '@@config/SET_TOKEN',
    SET_ALL = '@@config/SET_ALL',
    SET_KEY = '@@config/SET_KEY',
}
