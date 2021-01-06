import { ObjectItem, ObjectTypes, PlaylistTypes } from '../types';

// TYPES

export enum SortTypes {
  TOP = 'top',
  TRENDING = 'trending'
}

export type PlaylistIdentifier = {
  objectId?: string;
  playlistType: PlaylistTypes | ObjectTypes;
};

export interface PlaylistObjectItem<O = any> extends ObjectItem<O>, PlaylistIdentifier {}

// ACTIONS

export enum PlaylistActionTypes {
  GET_GENERIC_PLAYLIST = 'auryo.playlist.GET_GENERIC_PLAYLIST',
  SET_PLAYLIST_LOADING = 'auryo.playlist.SET_PLAYLIST_LOADING',
  GENERIC_PLAYLIST_FETCH_MORE = 'auryo.playlist.GENERIC_PLAYLIST_FETCH_MORE',

  SEARCH = 'auryo.playlist.SEARCH',
  SEARCH_FETCH_MORE = 'auryo.playlist.SEARCH_FETCH_MORE',

  GET_FORYOU_SELECTION = 'auryo.playlist.GET_FORYOU_SELECTION',
  GET_PLAYLIST_TRACKS = 'auryo.playlist.GET_PLAYLIST_TRACKS'
}
