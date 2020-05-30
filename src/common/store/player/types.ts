// TYPES

import { PlaylistIdentifier } from '../playlist';
import { ObjectStateItem } from '../types';

export type PlayerState = Readonly<{
  status: PlayerStatus;
  currentPlaylistId: PlaylistIdentifier | null;
  playingTrack: PlayingTrack | null;
  currentIndex: number;
  currentTime: number;
  duration: number;
  upNext: ObjectStateItem[];

  // queue: PlayingTrack[];
  // originalQueue: PlayingTrack[];
  // upNext: UpNextState;
  // containsPlaylists: PlayingPositionState[];
}>;

export interface PlayingTrack {
  id: number;
  un?: number;
  playlistId: PlaylistIdentifier;
  parentPlaylistID?: PlaylistIdentifier;
}

export interface PlayingPositionState {
  id: number;
  start: number;
  end: number;
}

export interface UpNextState {
  start: number;
  length: number;
}

export enum PlayerStatus {
  STOPPED = 'STOPPED',
  PAUSED = 'PAUSED',
  PLAYING = 'PLAYING'
}

export enum ChangeTypes {
  NEXT = 'NEXT',
  PREV = 'PREV'
}

export enum RepeatTypes {
  ONE = 'ONE',
  ALL = 'ALL'
}
export enum VolumeChangeTypes {
  UP = 'UP',
  DOWN = 'DOWN'
}

export type ProcessedQueueItems = [PlayingTrack[], PlayingTrack[]];

// ACTIONS

export enum PlayerActionTypes {
  TOGGLE_STATUS = '@@player/TOGGLE_STATUS',
  TOGGLE_SHUFFLE = '@@player/TOGGLE_SHUFFLE',
  PLAY_TRACK = '@@player/PLAY_TRACK',
  CHANGE_TRACK = '@@player/CHANGE_TRACK',
  PLAY_PLAYLIST = '@@player/PLAY_PLAYLIST',
  START_PLAY_MUSIC = '@@player/START_PLAY_MUSIC',
  SET_CURRENT_PLAYLIST = '@@player/SET_CURRENT_PLAYLIST',
  RESTART_TRACK = '@@player/RESTART_TRACK',
  TRACK_FINISHED = '@@player/TRACK_FINISHED',
  PLAYLIST_FINISHED = '@@player/PLAYLIST_FINISHED',
  START_PLAY_MUSIC_INDEX = '@@player/START_PLAY_MUSIC_INDEX',
  ADD_UP_NEXT = '@@player/ADD_UP_NEXT',
  CLEAR_UP_NEXT = '@@player/CLEAR_UP_NEXT',
  QUEUE_INSERT = '@@player/QUEUE_INSERT',
  SET_QUEUE = '@@player/SET_QUEUE',
  SHUFFLE_QUEUE = '@@player/SHUFFLE_QUEUE',
  SET_CURRENT_INDEX = '@@player/SET_CURRENT_INDEX',
  RESOLVE_PLAYLIST_ITEMS = '@@player/RESOLVE_PLAYLIST_ITEMS',

  // OLD
  SET_TIME = '@@player/SET_TIME',
  UPDATE_TIME = '@@player/UPDATE_TIME',
  SET_DURATION = '@@player/SET_DURATION',
  SET_TRACK = '@@player/SET_TRACK',
  TOGGLE_PLAYING = '@@player/TOGGLE_PLAYING',
  SET_PLAYLIST = '@@player/SET_PLAYLIST'
}
