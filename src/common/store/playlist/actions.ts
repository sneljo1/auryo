import { wError, wSuccess } from '@common/utils/reduxUtils';
import { EntitiesOf, EpicFailure, Normalized, SoundCloud } from '@types';
import { createAction, createAsyncAction } from 'typesafe-actions';
import { PlaylistActionTypes, PlaylistIdentifier, PlaylistObjectItem, SortTypes } from '../types';

export const getGenericPlaylist = createAsyncAction(
  String(PlaylistActionTypes.GET_GENERIC_PLAYLIST),
  wSuccess(PlaylistActionTypes.GET_GENERIC_PLAYLIST),
  wError(PlaylistActionTypes.GET_GENERIC_PLAYLIST)
)<
  PlaylistIdentifier & { refresh: boolean; sortType?: SortTypes; searchString?: string },
  PlaylistObjectItem & { refresh?: boolean; query?: string },
  EpicFailure & PlaylistIdentifier
>();

export const genericPlaylistFetchMore = createAsyncAction(
  String(PlaylistActionTypes.GENERIC_PLAYLIST_FETCH_MORE),
  wSuccess(PlaylistActionTypes.GENERIC_PLAYLIST_FETCH_MORE),
  wError(PlaylistActionTypes.GENERIC_PLAYLIST_FETCH_MORE)
)<PlaylistIdentifier, PlaylistObjectItem & { shuffle?: boolean }, EpicFailure & PlaylistIdentifier>();

export const setPlaylistLoading = createAction(PlaylistActionTypes.SET_PLAYLIST_LOADING)<PlaylistIdentifier>();

export const getSearchPlaylist = createAction(PlaylistActionTypes.SEARCH)<
  { query?: string; tag?: string; refresh: boolean } & PlaylistIdentifier
>();
export const searchPlaylistFetchMore = createAction(PlaylistActionTypes.SEARCH_FETCH_MORE)<PlaylistIdentifier>();

export const getForYouSelection = createAsyncAction(
  String(PlaylistActionTypes.GET_FORYOU_SELECTION),
  wSuccess(PlaylistActionTypes.GET_FORYOU_SELECTION),
  wError(PlaylistActionTypes.GET_FORYOU_SELECTION)
)<
  unknown,
  {
    objects: ForYourObject[];
    entities: EntitiesOf<Omit<SoundCloud.Playlist, 'tracks'> & { tracks: Normalized.NormalizedResult[] }>;
    result: Array<Normalized.NormalizedPersonalizedItem>;
  },
  EpicFailure
>();

export const getPlaylistTracks = createAsyncAction(
  String(PlaylistActionTypes.GET_PLAYLIST_TRACKS),
  wSuccess(PlaylistActionTypes.GET_PLAYLIST_TRACKS),
  wError(PlaylistActionTypes.GET_PLAYLIST_TRACKS)
)<PlaylistIdentifier, PlaylistIdentifier, EpicFailure & PlaylistIdentifier>();

export type ForYourObject = Omit<PlaylistObjectItem, 'entities' | 'nextUrl' | 'objectId'> & { objectId: string };
