import { GetPlaylistOptions, Normalized, SoundCloud } from '@types';
import { normalize, schema } from 'normalizr';
import { action } from 'typesafe-actions';
import { ThunkResult } from '..';
import fetchComments from '../../api/fetchComments';
import fetchPlaylist from '../../api/fetchPlaylist';
import fetchToJson from '../../api/helpers/fetchToJson';
import { trackSchema } from '../../schemas';
import * as SC from '../../utils/soundcloudUtils';
import { PlayerActionTypes, ProcessedQueueItems } from '../player/types';
// eslint-disable-next-line import/no-cycle
import { processQueueItems } from '../player/actions';
import { SortTypes } from '../playlist/types';
import { getPlaylistObjectSelector } from './selectors';
import { ObjectsActionTypes, ObjectState, ObjectTypes } from './types';
import { Track } from 'src/types/soundcloud';

const canFetch = (current: ObjectState<any>): boolean => !current || (!!current && !current.isFetching);
const canFetchMore = (current: ObjectState<any>): boolean => canFetch(current) && current && current.nextUrl !== null;

// TODO refactor, too hacky. Maybe redux-observables?
// tslint:disable-next-line:max-line-length
export function getPlaylist(
  url: string,
  objectId: string,
  options: GetPlaylistOptions = { refresh: false, appendId: null }
): ThunkResult<Promise<any>> {
  return async (dispatch, getState) => {
    const {
      config: { hideReposts }
    } = getState();

    const { value } = await dispatch<Promise<{ value: { result: Normalized.NormalizedResult[] } }>>({
      type: ObjectsActionTypes.SET,
      payload: {
        promise: fetchPlaylist(url, objectId, hideReposts).then(({ normalized, json }) => ({
          objectId,
          objectType: ObjectTypes.PLAYLISTS,
          entities: normalized.entities,
          result: options.appendId
            ? [{ id: options.appendId, schema: 'tracks' }, ...normalized.result]
            : normalized.result,
          nextUrl: json.next_href ? SC.appendToken(json.next_href) : null,
          futureUrl: json.future_href ? SC.appendToken(json.future_href) : null,
          refresh: options.refresh
        })),
        data: {
          objectId,
          objectType: ObjectTypes.PLAYLISTS
        }
      }
    } as any);

    const {
      player: { currentPlaylistId, queue }
    } = getState();

    if (objectId === currentPlaylistId && value.result.length) {
      if (value && value.result) {
        const { result } = value;

        if (result.length) {
          const [items, originalItems] = await dispatch<Promise<ProcessedQueueItems>>(processQueueItems(result));

          dispatch({
            type: PlayerActionTypes.QUEUE_INSERT,
            payload: {
              items,
              originalItems,
              index: queue.length
            }
          });
        }
      }
    }
  };
}

function getCommentsByUrl(url: string, objectId: string): ThunkResult<Promise<any>> {
  return async (dispatch, getState) => {
    const { objects } = getState();

    const objectType = ObjectTypes.COMMENTS;
    const comments = objects[objectType];

    if (!canFetch(comments[objectId])) {
      return Promise.resolve();
    }

    return dispatch<Promise<any>>({
      type: ObjectsActionTypes.SET,
      payload: {
        promise: fetchComments(url).then(({ normalized, json }) => ({
          objectId,
          objectType,
          entities: normalized.entities,
          result: normalized.result,
          nextUrl: json.next_href ? SC.appendToken(json.next_href) : null,
          futureUrl: json.future_href ? SC.appendToken(json.future_href) : null
        })),
        data: {
          objectId,
          objectType
        }
      }
    } as any);
  };
}

export function getComments(trackId: number) {
  return getCommentsByUrl(SC.getCommentsUrl(trackId), trackId.toString());
}

export const setObject = (
  objectId: string,
  objectType: ObjectTypes,
  entities: Normalized.NormalizedEntities,
  result: Normalized.NormalizedResult[],
  nextUrl?: string,
  futureUrl?: string,
  fetchedItems = 0
) => {
  return action(ObjectsActionTypes.SET, {
    objectId,
    objectType,
    entities,
    result,
    nextUrl: nextUrl ? SC.appendToken(nextUrl) : null,
    futureUrl: futureUrl ? SC.appendToken(futureUrl) : null,
    fetchedItems
  });
};

export function fetchPlaylistIfNeeded(playlistId: number): ThunkResult<Promise<any>> {
  return async (dispatch, getState) => {
    const playlistObject = getPlaylistObjectSelector(playlistId.toString())(getState());

    if (!playlistObject || (playlistObject && playlistObject.fetchedItems === 0)) {
      await dispatch<Promise<any>>({
        type: ObjectsActionTypes.SET,
        payload: {
          promise: fetchPlaylist(SC.getPlaylistTracksUrl(playlistId), playlistId.toString()).then(
            ({ normalized, json }) => {
              if (normalized.entities && normalized.entities.playlistEntities) {
                const playlist = normalized.entities.playlistEntities[playlistId];

                let fetchedItems: Partial<SoundCloud.Track>[] = [];

                if (json.tracks) {
                  fetchedItems = json.tracks.filter((t: Partial<SoundCloud.Track>) => t.user !== undefined);
                }

                const fetchedItemsIds = fetchedItems.map(item => item.id);

                // eslint-disable-next-line no-case-declarations
                const result = playlist.tracks.filter(t => fetchedItemsIds.indexOf(t.id) !== -1);

                return {
                  objectId: playlistId,
                  objectType: ObjectTypes.PLAYLISTS,
                  entities: normalized.entities,
                  result,
                  nextUrl: json.next_href ? SC.appendToken(json.next_href) : null,
                  futureUrl: json.future_href ? SC.appendToken(json.future_href) : null,
                  fetchedItems: fetchedItems.length
                };
              }

              return {};
            }
          ),
          data: {
            objectId: playlistId,
            objectType: ObjectTypes.PLAYLISTS
          }
        }
      } as any);

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await dispatch<Promise<any>>(fetchPlaylistTracks(playlistId));
    }
  };
}

export function fetchPlaylistTracks(
  playlistId: number,
  size = 20,
  ids: Normalized.NormalizedResult[] = []
): ThunkResult<Promise<any>> {
  return async (dispatch, getState) => {
    const playlistObject = getPlaylistObjectSelector(playlistId.toString())(getState());

    if (!playlistObject) {
      await dispatch<Promise<any>>(fetchPlaylistIfNeeded(playlistId));

      return Promise.resolve();
    }

    let fetchIds = ids;

    if (
      (playlistObject.fetchedItems === playlistObject.items.length || playlistObject.isFetching) &&
      !fetchIds.length
    ) {
      return Promise.resolve();
    }

    if (!fetchIds.length) {
      const fetched = playlistObject.fetchedItems || 0;

      let newCount = fetched + size;

      if (newCount > playlistObject.items.length) {
        newCount = playlistObject.items.length;
      }

      // tslint:disable-next-line: no-parameter-reassignment
      fetchIds = playlistObject.items.slice(fetched, newCount);
    }

    if (fetchIds && fetchIds.length) {
      return dispatch<Promise<any>>({
        type: ObjectsActionTypes.SET_TRACKS,
        payload: {
          promise: fetchToJson(SC.getTracks(fetchIds.map(id => id.id))).then((tracks: Track[]) => {
            const normalized = normalize(
              tracks,
              new schema.Array(
                {
                  tracks: trackSchema
                },
                input => `${input.kind}s`
              )
            );

            let fetchedItems: Partial<SoundCloud.Track>[] = [];

            if (tracks) {
              fetchedItems = tracks.filter((t: Partial<SoundCloud.Track>) => t.user !== undefined);
            }

            const fetchedItemsIds = fetchedItems.map(item => item.id);

            // eslint-disable-next-line no-case-declarations
            const result = fetchIds.filter(t => fetchedItemsIds.indexOf(t.id) !== -1);

            return {
              objectId: playlistId,
              objectType: ObjectTypes.PLAYLISTS,
              entities: normalized.entities,

              fetchedIds: result,
              shouldFetchedIds: fetchIds
            };
          }),
          data: {
            objectId: playlistId
          }
        }
      } as any);
    }

    return Promise.resolve();
  };
}

/**
 * Fetch new chart if needed
 */
export function fetchChartsIfNeeded(objectId: string, sortType: SortTypes = SortTypes.TOP): ThunkResult<void> {
  return (dispatch, getState) => {
    const playlistObject = getPlaylistObjectSelector(objectId)(getState());

    if (!playlistObject) {
      dispatch(getPlaylist(SC.getChartsUrl(objectId.split('_')[0], sortType, 25), objectId));
    }
  };
}

export function canFetchPlaylistTracks(playlistId: string): ThunkResult<void> {
  return (_dispatch, getState) => {
    const playlistObject = getPlaylistObjectSelector(playlistId)(getState());

    if (!playlistObject || playlistObject.fetchedItems === playlistObject.items.length || playlistObject.isFetching) {
      return false;
    }

    let newCount = playlistObject.fetchedItems + 20;

    if (newCount > playlistObject.items.length) {
      newCount = playlistObject.items.length;
    }

    const ids = playlistObject.items.slice(playlistObject.fetchedItems, newCount);

    return !!ids.length;
  };
}

export function fetchTracks(ids: number[]): ThunkResult<void> {
  return dispatch => {
    if (!ids || (ids && !ids.length)) {
      return null;
    }

    return dispatch({
      type: ObjectsActionTypes.SET_TRACKS,
      payload: {
        promise: fetchToJson(SC.getTracks(ids)).then(tracks => {
          const normalized = normalize(
            tracks,
            new schema.Array(
              {
                tracks: trackSchema
              },
              input => `${input.kind}s`
            )
          );

          return {
            entities: normalized.entities
          };
        }),
        data: {
          entities: {
            trackEntities: ids.reduce(
              (obj, id) => ({
                ...obj,
                [id]: {
                  loading: true
                }
              }),
              {}
            )
          }
        }
      }
    });
  };
}

export const unset = (objectId: string) =>
  action(ObjectsActionTypes.UNSET, {
    objectId,
    objectType: ObjectTypes.PLAYLISTS
  });

export function fetchMore(objectId: string, objectType: ObjectTypes): ThunkResult<Promise<any>> {
  return async (dispatch, getState) => {
    const { objects } = getState();
    const objectGroup = objects[objectType] || {};

    if (canFetchMore(objectGroup[objectId])) {
      const { nextUrl } = objectGroup[objectId];

      if (nextUrl) {
        switch (objectType) {
          case ObjectTypes.PLAYLISTS:
            return dispatch<Promise<any>>(getPlaylist(nextUrl, objectId));
          case ObjectTypes.COMMENTS:
            return dispatch<Promise<any>>(getCommentsByUrl(nextUrl, objectId));
          default:
        }
      }
    }

    return Promise.resolve();
  };
}

export function canFetchMoreOf(objectId: string, type: ObjectTypes): ThunkResult<boolean> {
  return (_dispatch, getState) => {
    const { objects } = getState();
    const objectGroup = objects[type] || {};
    const object = objectGroup[objectId];

    return canFetchMore(object);
  };
}
