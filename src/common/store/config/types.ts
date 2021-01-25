import { RepeatTypes } from '../types';

// TYPES
export interface Config extends Object {
  updatedAt: number;
  auth: {
    token: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
  };
  audio: AudioConfig;
  repeat: RepeatTypes | null;
  shuffle: boolean;
  version: string;
  lastfm?: LastFmConfig;
  hideReposts: boolean;
  enableProxy: boolean;
  proxy: ProxyConfig;
  app: AppConfig;
  lastLogin: number | null;
}

export type ConfigState = Readonly<Config>;

export interface AppConfig {
  analytics: boolean;
  crashReports: boolean;
  downloadPath: string;
  showTrackChangeNotification: boolean;
  theme: string;
}

export interface AudioConfig {
  volume: number;
  playbackDeviceId: null | string;
  muted: boolean;
}

export interface LastFmConfig {
  key: string;
  user: string;
}

export interface ProxyConfig {
  host?: string | null;
  port?: number;
  username?: string;
  password?: string;
}

export type ConfigValue = string | number | boolean | object | null | (string | number | object)[];

// ACTIONS
export enum ConfigActionTypes {
  SET_CONFIG = 'auryo.config.SET_ALL',
  SET_CONFIG_KEY = 'auryo.config.SET_KEY'
}
