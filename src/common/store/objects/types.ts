import { Normalized } from '@types';

// TYPES

export enum ObjectTypes {
  PLAYLISTS = 'PLAYLISTS',
  COMMENTS = 'COMMENTS'
}

export enum PlaylistTypes {
  // Without ids
  LIKES = 'LIKES',
  STREAM = 'STREAM',
  DISCOVER = 'DISCOVER',
  MYTRACKS = 'MYTRACKS',
  PLAYLIST = 'PLAYLIST',
  PLAYLISTS = 'PLAYLISTS',

  // With ids
  RELATED = 'RELATED',
  ARTIST_LIKES = 'ARTIST_LIKES',
  ARTIST_TRACKS = 'ARTIST_TRACKS',
  SEARCH = 'SEARCH',
  SEARCH_USER = 'SEARCH_USER',
  SEARCH_TRACK = 'SEARCH_TRACK',
  SEARCH_PLAYLIST = 'SEARCH_PLAYLIST'
}

export type ObjectsState = Readonly<{
  [ObjectTypes.PLAYLISTS]: ObjectGroup;
  [ObjectTypes.COMMENTS]: ObjectGroup;
}>;

export interface ObjectGroup {
  [id: string]: ObjectState<Normalized.NormalizedResult>;
}

export interface ObjectState<T> {
  isFetching: boolean;
  error: string | null;
  meta: object;
  items: T[];
  futureUrl: string | null;
  nextUrl: string | null;
  fetchedItems: number;
}

// ACTIONS

export enum ObjectsActionTypes {
  SET = '@@objects/SET',
  UNSET = '@@objects/UNSET',
  UNSET_TRACK = '@@objects/UNSET_TRACK',
  SET_TRACKS = '@@objects/SET_TRACKS',
  UPDATE_ITEMS = '@@objects/UPDATE_ITEMS'
}
