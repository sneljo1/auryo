import { ObjectTypes, PlaylistTypes } from '../objects';

// TYPES

export enum SortTypes {
  TOP = 'top',
  TRENDING = 'trending'
}

export type PlaylistIdentifier = {
  objectId?: string;
  playlistType: PlaylistTypes | ObjectTypes;
};

// ACTIONS

export enum PlaylistActionTypes {
  GET_GENERIC_PLAYLIST = '@@playlist/GET_GENERIC_PLAYLIST',
  SET_PLAYLIST_LOADING = '@@playlist/SET_PLAYLIST_LOADING',
  GENERIC_PLAYLIST_FETCH_MORE = '@@playlist/GENERIC_PLAYLIST_FETCH_MORE',

  SEARCH = '@@playlist/SEARCH',
  SEARCH_FETCH_MORE = '@@playlist/SEARCH_FETCH_MORE',

  GET_FORYOU_SELECTION = '@@playlist/GET_FORYOU_SELECTION'
}
