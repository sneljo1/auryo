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
  TOGGLE_STATUS = 'auryo.player.TOGGLE_STATUS',
  TOGGLE_SHUFFLE = 'auryo.player.TOGGLE_SHUFFLE',
  SEEK_TO = 'auryo.player.SEEK_TO',
  PLAY_TRACK = 'auryo.player.PLAY_TRACK',
  CHANGE_TRACK = 'auryo.player.CHANGE_TRACK',
  PLAY_PLAYLIST = 'auryo.player.PLAY_PLAYLIST',
  START_PLAY_MUSIC = 'auryo.player.START_PLAY_MUSIC',
  SET_CURRENT_PLAYLIST = 'auryo.player.SET_CURRENT_PLAYLIST',
  RESTART_TRACK = 'auryo.player.RESTART_TRACK',
  TRACK_FINISHED = 'auryo.player.TRACK_FINISHED',
  PLAYLIST_FINISHED = 'auryo.player.PLAYLIST_FINISHED',
  START_PLAY_MUSIC_INDEX = 'auryo.player.START_PLAY_MUSIC_INDEX',
  ADD_UP_NEXT = 'auryo.player.ADD_UP_NEXT',
  CLEAR_UP_NEXT = 'auryo.player.CLEAR_UP_NEXT',
  QUEUE_INSERT = 'auryo.player.QUEUE_INSERT',
  SET_QUEUE = 'auryo.player.SET_QUEUE',
  SHUFFLE_QUEUE = 'auryo.player.SHUFFLE_QUEUE',
  SET_CURRENT_INDEX = 'auryo.player.SET_CURRENT_INDEX',
  RESOLVE_PLAYLIST_ITEMS = 'auryo.player.RESOLVE_PLAYLIST_ITEMS',
  REMOVE_FROM_QUEUE = 'auryo.player.REMOVE_FROM_QUEUE',
  PLAY_TRACK_FROM_QUEUE = 'auryo.player.PLAY_TRACK_FROM_QUEUE',

  // OLD
  SET_TIME = 'auryo.player.SET_TIME',
  UPDATE_TIME = 'auryo.player.UPDATE_TIME',
  SET_DURATION = 'auryo.player.SET_DURATION',
  SET_TRACK = 'auryo.player.SET_TRACK',
  TOGGLE_PLAYING = 'auryo.player.TOGGLE_PLAYING',
  SET_PLAYLIST = 'auryo.player.SET_PLAYLIST',
  REMOVE_FROM_UP_NEXT = 'REMOVE_FROM_UP_NEXT',
  REMOVE_FROM_QUEUE_OR_UP_NEXT = 'REMOVE_FROM_QUEUE_OR_UP_NEXT'
}
