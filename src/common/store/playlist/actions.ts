import { Intent } from '@blueprintjs/core';
import { PersonalisedCollectionItem } from '@common/api/fetchPersonalised';
import { wError, wSuccess } from '@common/utils/reduxUtils';
import { Collection, EntitiesOf, EpicFailure, Normalized, SoundCloud, ThunkResult } from '@types';
import { createAction, createAsyncAction } from 'typesafe-actions';
import fetchToJson from '../../api/helpers/fetchToJson';
import { SC } from '../../utils';
import { getPlaylistEntity } from '../entities/selectors';
import { ObjectsActionTypes, ObjectTypes } from '../objects';
import { getPlaylistObjectSelector } from '../objects/selectors';
import { addToast } from '../ui/actions';
import { PlaylistActionTypes, PlaylistIdentifier, SortTypes } from './types';

interface ObjectItem<O = any> extends PlaylistIdentifier {
  objectType: ObjectTypes;
  entities: EntitiesOf<O>;
  result: Normalized.NormalizedResult[];
  nextUrl?: string;
  fetchedItemsIds?: number[];
}

export const getGenericPlaylist = createAsyncAction(
  PlaylistActionTypes.GET_GENERIC_PLAYLIST,
  wSuccess(PlaylistActionTypes.GET_GENERIC_PLAYLIST),
  wError(PlaylistActionTypes.GET_GENERIC_PLAYLIST)
)<
  PlaylistIdentifier & { refresh: boolean; sortType?: SortTypes; searchString?: string },
  ObjectItem & { refresh?: boolean; query?: string },
  EpicFailure & PlaylistIdentifier
>();

export const genericPlaylistFetchMore = createAsyncAction(
  PlaylistActionTypes.GENERIC_PLAYLIST_FETCH_MORE,
  wSuccess(PlaylistActionTypes.GENERIC_PLAYLIST_FETCH_MORE),
  wError(PlaylistActionTypes.GENERIC_PLAYLIST_FETCH_MORE)
)<PlaylistIdentifier, ObjectItem, EpicFailure & PlaylistIdentifier>();

export const setPlaylistLoading = createAction(PlaylistActionTypes.SET_PLAYLIST_LOADING)<PlaylistIdentifier>();

export const getSearchPlaylist = createAction(PlaylistActionTypes.SEARCH)<
  { query?: string; tag?: string; refresh: boolean } & PlaylistIdentifier
>();
export const searchPlaylistFetchMore = createAction(PlaylistActionTypes.SEARCH_FETCH_MORE)<PlaylistIdentifier>();

export const getForYouSelection = createAsyncAction(
  PlaylistActionTypes.GET_FORYOU_SELECTION,
  wSuccess(PlaylistActionTypes.GET_FORYOU_SELECTION),
  wError(PlaylistActionTypes.GET_FORYOU_SELECTION)
)<
  undefined,
  {
    objects: ForYourObject[];
    entities: EntitiesOf<Omit<SoundCloud.Playlist, 'tracks'> & { tracks: Normalized.NormalizedResult[] }>;
    result: Array<Normalized.NormalizedPersonalizedItem>;
  },
  EpicFailure
>();

export type ForYourObject = Omit<ObjectItem, 'entities' | 'nextUrl' | 'objectId'> & { objectId: string };
/**
 * Add track to certain playlist
 */
export function togglePlaylistTrack(trackId: number, playlistId: number): ThunkResult<any> {
  return async (dispatch, getState) => {
    const state = getState();

    const playlistObject = getPlaylistObjectSelector(playlistId.toString())(state);
    const playlistEntity = getPlaylistEntity(playlistId)(state);

    if (!playlistObject || !playlistEntity) {
      return;
    }

    let newitems: Normalized.NormalizedResult[] = [];

    const track: Normalized.NormalizedResult = { id: trackId, schema: 'tracks' };

    const found = !!playlistObject.items.find(t => t.id === track.id && t.schema === track.schema);

    let add = true;

    if (!found) {
      newitems = [...playlistObject.items, track];
    } else {
      newitems = [...playlistObject.items.filter(normalizedResult => normalizedResult.id !== track.id)];
      add = false;
    }

    dispatch({
      type: ObjectsActionTypes.UPDATE_ITEMS,
      payload: {
        promise: fetchToJson(SC.getPlaylistupdateUrl(playlistId), {
          method: 'PUT',
          data: {
            playlist: {
              tracks: newitems.map(i => i.id)
            }
          }
        }).then(() => {
          const {
            entities: { trackEntities }
          } = getState();

          const { duration } = trackEntities[trackId];

          dispatch(
            addToast({
              message: `Track ${add ? 'added to' : 'removed from'} playlist`,
              intent: Intent.SUCCESS
            })
          );

          return {
            objectId: playlistId,
            objectType: ObjectTypes.PLAYLISTS,
            items: newitems,
            entities: {
              playlistEntities: {
                [playlistId]: {
                  track_count: !found ? playlistEntity.track_count + 1 : playlistEntity.track_count - 1,
                  duration: !found ? playlistEntity.duration + duration : playlistEntity.duration - duration
                }
              }
            }
          };
        }),
        data: {
          objectId: playlistId,
          objectType: ObjectTypes.PLAYLISTS
        }
      }
    });
  };
}

// This method is unused
export function createPlaylist(title: string, type: string, tracks: Normalized.NormalizedResult[]) {
  return () =>
    fetchToJson(SC.getPlaylistUrl(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      data: {
        playlist: {
          title,
          sharing: type,
          tracks: tracks.map(i => i.id)
        }
      }
    });
}

// This method is unused because a playlist only gets deleted after a while,
// not sure if we can check if it's pending deletion. Otherwise it would be bad UX
export function deletePlaylist(playlistId: string): ThunkResult<any> {
  return (dispatch, getState) => {
    const {
      entities: { playlistEntities }
    } = getState();

    const playlistEntitity = playlistEntities[playlistId];

    if (playlistEntitity) {
      fetchToJson(SC.getPlaylistDeleteUrl(playlistId), {
        method: 'DELETE'
      })
        .then(() => {
          dispatch(
            addToast({
              message: `Playlist has been deleted`,
              intent: Intent.SUCCESS
            })
          );
        })
        .catch(() => {
          dispatch(
            addToast({
              message: `Unable to delete playlist`,
              intent: Intent.DANGER
            })
          );
        });
    }
  };
}
