import { EntitiesOf, Normalized } from '@types';
import { AxiosError } from 'axios';
import { PlaylistIdentifier } from '../playlist';

// TYPES

export interface ObjectItem<O = any> {
  objectType: ObjectTypes;
  entities: EntitiesOf<O>;
  result: Normalized.NormalizedResult[];
  nextUrl?: string;
  fetchedItemsIds?: number[];
  refresh?: boolean;
}

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
  ARTIST_TOP_TRACKS = 'ARTIST_TOP_TRACKS',
  SEARCH = 'SEARCH',
  SEARCH_USER = 'SEARCH_USER',
  SEARCH_TRACK = 'SEARCH_TRACK',
  SEARCH_PLAYLIST = 'SEARCH_PLAYLIST',
  QUEUE = 'QUEUE'
}

export type ObjectsState = Readonly<{
  [PlaylistTypes.STREAM]: ObjectState;
  [PlaylistTypes.LIKES]: ObjectState;
  [PlaylistTypes.MYTRACKS]: ObjectState;
  [PlaylistTypes.MYPLAYLISTS]: ObjectState;
  [PlaylistTypes.PLAYLIST]: ObjectGroup;
  [PlaylistTypes.SEARCH]: ObjectState;
  [PlaylistTypes.SEARCH_PLAYLIST]: ObjectState;
  [PlaylistTypes.SEARCH_USER]: ObjectState;
  [PlaylistTypes.SEARCH_TRACK]: ObjectState;
  [PlaylistTypes.QUEUE]: ObjectState;

  [ObjectTypes.PLAYLISTS]: ObjectGroup;
  [ObjectTypes.COMMENTS]: ObjectGroup;
}>;

export interface ObjectGroup {
  [id: string]: ObjectState;
}

export interface ObjectState {
  isFetching: boolean;
  error: AxiosError | Error | null;
  items: ObjectStateItem[];
  nextUrl?: string | null;
  fetchedItems: number;
  itemsToFetch: Normalized.NormalizedResult[];
  meta: { query?: string; createdAt?: number; updatedAt?: number; originalPlaylistID?: PlaylistIdentifier };
}

export type ObjectStateItem = Normalized.NormalizedResult & { parentPlaylistID?: PlaylistIdentifier };

// ACTIONS

export enum ObjectsActionTypes {
  SET = '@@objects/SET',
  UNSET = '@@objects/UNSET',
  UNSET_TRACK = '@@objects/UNSET_TRACK',
  SET_TRACKS = '@@objects/SET_TRACKS',
  UPDATE_ITEMS = '@@objects/UPDATE_ITEMS'
}
