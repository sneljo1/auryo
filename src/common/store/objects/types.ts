import { Normalized } from '@types';
import { AxiosError } from 'axios';

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
  MYPLAYLISTS = 'MYPLAYLISTS',
  CHART = 'CHART',

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
  [PlaylistTypes.STREAM]: ObjectState;
  [PlaylistTypes.LIKES]: ObjectState;
  [PlaylistTypes.MYTRACKS]: ObjectState;
  [PlaylistTypes.MYPLAYLISTS]: ObjectState;
  [PlaylistTypes.PLAYLIST]: ObjectState;
  [PlaylistTypes.SEARCH]: ObjectState;
  [PlaylistTypes.SEARCH_PLAYLIST]: ObjectState;
  [PlaylistTypes.SEARCH_USER]: ObjectState;
  [PlaylistTypes.SEARCH_TRACK]: ObjectState;

  [ObjectTypes.PLAYLISTS]: ObjectGroup;
  [ObjectTypes.COMMENTS]: ObjectGroup;
}>;

export interface ObjectGroup {
  [id: string]: ObjectState;
}

export interface ObjectState {
  isFetching: boolean;
  error: AxiosError | Error | null;
  items: Normalized.NormalizedResult[];
  nextUrl?: string | null;
  fetchedItems: number;
  itemsToFetch: Normalized.NormalizedResult[];
  meta: { query?: string; createdAt?: number; updatedAt?: number };
}

// ACTIONS

export enum ObjectsActionTypes {
  SET = '@@objects/SET',
  UNSET = '@@objects/UNSET',
  UNSET_TRACK = '@@objects/UNSET_TRACK',
  SET_TRACKS = '@@objects/SET_TRACKS',
  UPDATE_ITEMS = '@@objects/UPDATE_ITEMS'
}
