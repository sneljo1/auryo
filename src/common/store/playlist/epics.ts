import { playlistSchema, trackSchema, userSchema } from '@common/schemas';
import { SC } from '@common/utils';
import { EpicError } from '@common/utils/errors/EpicError';
import { Collection, EntitiesOf, Normalized, SoundCloud, ResultOf } from '@types';
import { RootState } from 'AppReduxTypes';
import { AxiosError } from 'axios';
import { isEqual, uniqWith } from 'lodash';
import { normalize, schema } from 'normalizr';
import { EMPTY, from, of, throwError } from 'rxjs';
import { catchError, filter, map, startWith, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { currentUserSelector } from '../auth/selectors';
import { ObjectTypes, PlaylistTypes } from '../objects';
import { getPlaylistObjectSelector } from '../objects/selectors';
import { RootEpic } from '../types';
import {
  genericPlaylistFetchMore,
  getGenericPlaylist,
  getSearchPlaylist,
  searchPlaylistFetchMore,
  setPlaylistLoading,
  getForYouSelection,
  ForYourObject
} from './actions';
import * as APIService from './api';

const handleEpicError = (error: any) => {
  if ((error as AxiosError).isAxiosError) {
    console.log(error.response);
  }
  console.error(error?.message);
  // TODO Sentry?
  return error;
};

export const getGenericPlaylistEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(getGenericPlaylist.request)),
    tap(action => console.log(`${action.type} from ${process.type}`)),
    map(action => action.payload),
    withLatestFrom(state$),
    switchMap(([{ playlistType, objectId, refresh, sortType }, state]) => {
      const {
        config: { hideReposts }
      } = state;
      const me = currentUserSelector(state);

      let ob$;

      switch (playlistType) {
        case PlaylistTypes.STREAM:
          ob$ = APIService.fetchStream({ limit: hideReposts ? 42 : 21 });
          break;
        case PlaylistTypes.LIKES:
          ob$ = APIService.fetchLikes({ limit: 21, userId: me?.id || '' });
          break;
        case PlaylistTypes.MYTRACKS:
          ob$ = APIService.fetchMyTracks({ limit: 21, userId: me?.id || '' });
          break;
        case PlaylistTypes.MYPLAYLISTS:
          ob$ = APIService.fetchPlaylists({ limit: 21 });
          break;
        case PlaylistTypes.PLAYLIST:
          if (!objectId) {
            ob$ = throwError(new Error(`${playlistType}: objectId=${objectId} must be defined`));
            break;
          }
          ob$ = APIService.fetchPlaylist({ playlistId: objectId });
          break;
        case PlaylistTypes.CHART:
          if (!objectId) {
            ob$ = throwError(new Error(`${playlistType}: objectId=${objectId} must be defined`));
            break;
          }
          ob$ = APIService.fetchCharts({ limit: 21, genre: objectId, sort: sortType });
          break;
        default:
          ob$ = throwError(new EpicError(`${playlistType}: ${objectId} not found`));
      }

      return from(ob$).pipe(
        map(json => {
          switch (playlistType) {
            case PlaylistTypes.STREAM:
              return processStreamItems(state)(json as Collection<APIService.FeedItem>);
            case PlaylistTypes.LIKES:
              return processLikeItems(state)(json as Collection<APIService.LikeItem>);
            case PlaylistTypes.MYTRACKS:
              return processMyTracks(state)(json as Collection<SoundCloud.Track>);
            case PlaylistTypes.MYPLAYLISTS:
              return processStreamItems(state)(json as Collection<APIService.PlaylistItem>);
            case PlaylistTypes.PLAYLIST:
              return processPlaylist(state)(json as SoundCloud.Playlist, objectId);
            case PlaylistTypes.CHART:
              return processCharts(state)(json as Collection<APIService.ChartItem>);
            default:
              return {
                json,
                normalized: normalize(json, playlistSchema)
              };
          }
        }),
        map(data =>
          getGenericPlaylist.success({
            objectId,
            playlistType,
            objectType: ObjectTypes.PLAYLISTS,
            entities: data.normalized.entities,
            result: data.normalized.result,
            refresh,
            nextUrl: data.json?.['next_href'],
            fetchedItemsIds: data?.['fetchedItemsIds']
          })
        ),
        catchError(error =>
          of(
            getGenericPlaylist.failure({
              error: handleEpicError(error),
              objectId,
              playlistType
            })
          )
        )
      );
    })
  );

export const genericPlaylistFetchMoreEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(genericPlaylistFetchMore.request)),
    withLatestFrom(state$),
    map(([{ payload }, state]) => {
      const { objectId, playlistType } = payload;

      const object = getPlaylistObjectSelector({ objectId, playlistType })(state);

      return {
        payload,
        object
      };
    }),
    // Don't do anything if we are already fetching this playlist
    filter(({ object, payload }) => {
      if (payload.playlistType !== PlaylistTypes.PLAYLIST) {
        return !!object && !object.isFetching && !!object.nextUrl;
      }

      return !!object && !object.isFetching && !!object.itemsToFetch.length;
    }),
    withLatestFrom(state$),
    switchMap(([{ object, payload }, state]) => {
      const { playlistType, objectId } = payload;
      const urlWithToken = SC.appendToken(object?.nextUrl as string);
      const itemsToFetch = (object?.itemsToFetch.map(i => i.id) || []).slice(0, 15);

      let ob$;

      if (playlistType === PlaylistTypes.PLAYLIST) {
        ob$ = APIService.fetchTracks({ ids: itemsToFetch });
      } else {
        ob$ = APIService.fetchFromUrl<any>(urlWithToken);
      }

      return from(ob$).pipe(
        map(json => {
          switch (playlistType) {
            case PlaylistTypes.STREAM:
              return processStreamItems(state)(json);
            case PlaylistTypes.LIKES:
              return processLikeItems(state)(json);
            case PlaylistTypes.MYTRACKS:
              return processMyTracks(state)(json);
            case PlaylistTypes.MYPLAYLISTS:
              return processStreamItems(state)(json);
            case PlaylistTypes.PLAYLIST:
              return processPlaylistTracks(state)(json, itemsToFetch);
            case PlaylistTypes.CHART:
              return processCharts(state)(json);
            default:
              return {
                json,
                normalized: normalize(json, playlistSchema)
              };
          }
        }),
        map(data =>
          genericPlaylistFetchMore.success({
            objectId,
            playlistType,
            entities: data.normalized.entities,
            objectType: ObjectTypes.PLAYLISTS,
            result: data.normalized.result,
            nextUrl: data.json?.['next_href'],
            fetchedItemsIds: data?.['fetchedItemsIds']
          })
        ),
        catchError(error =>
          of(
            genericPlaylistFetchMore.failure({
              error: handleEpicError(error),
              objectId,
              playlistType
            })
          )
        ),
        startWith(setPlaylistLoading({ objectId, playlistType }))
      );
    })
  );

export const searchEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(getSearchPlaylist)),
    tap(action => console.log(`${action.type} from ${process.type}`)),
    map(action => action.payload),
    switchMap(({ playlistType, objectId, query, tag, refresh }) => {
      // TODO
      // if (query && isSoundCloudUrl(query)) {
      //   return Promise.resolve(tryAndResolveQueryAsSoundCloudUrl(query, dispatch)) as any;
      // }

      let ob$;

      switch (playlistType) {
        case PlaylistTypes.SEARCH:
          if (query && query.length) {
            ob$ = APIService.searchAll({ query, limit: 21 });
          }
          break;
        case PlaylistTypes.SEARCH_TRACK:
          if (query && query.length) {
            ob$ = APIService.searchAll({ query, limit: 21, type: 'tracks' });
          } else if (tag) {
            ob$ = APIService.searchAll({ genre: tag, limit: 21, type: 'tracks' });
          }
          break;
        case PlaylistTypes.SEARCH_PLAYLIST:
          if (query && query.length) {
            ob$ = APIService.searchAll({ query, limit: 21, type: 'playlists_without_albums' });
          } else if (tag) {
            ob$ = APIService.fetchPlaylistsByTag({ tag, limit: 21 });
          }
          break;
        case PlaylistTypes.SEARCH_USER:
          if (query && query.length) {
            ob$ = APIService.searchAll({ query, limit: 21, type: 'users' });
          }
          break;
        default:
      }

      return from(ob$ || EMPTY).pipe(
        map(processCollection),
        map(data =>
          getGenericPlaylist.success({
            objectId,
            playlistType,
            objectType: ObjectTypes.PLAYLISTS,
            entities: data.normalized.entities,
            result: data.normalized.result,
            refresh,
            nextUrl: data.json?.['next_href'],
            fetchedItemsIds: data?.['fetchedItemsIds'],
            query: query || tag
          })
        ),
        catchError(error =>
          of(
            getGenericPlaylist.failure({
              error: handleEpicError(error),
              objectId,
              playlistType
            })
          )
        )
      );
    })
  );

export const searchFetchMoreEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(searchPlaylistFetchMore)),
    withLatestFrom(state$),
    map(([{ payload }, state]) => {
      const { objectId, playlistType } = payload;

      const object = getPlaylistObjectSelector({ objectId, playlistType })(state);

      return {
        payload,
        object
      };
    }),
    // Don't do anything if we are already fetching this playlist
    filter(({ object }) => !!object && !object.isFetching && !!object.nextUrl),
    switchMap(({ object, payload }) => {
      const { playlistType, objectId } = payload;
      const urlWithToken = SC.appendToken(object?.nextUrl as string);

      return from(APIService.fetchFromUrl<any>(urlWithToken)).pipe(
        map(processCollection),
        map(data =>
          genericPlaylistFetchMore.success({
            objectId,
            playlistType,
            entities: data.normalized.entities,
            objectType: ObjectTypes.PLAYLISTS,
            result: data.normalized.result,
            nextUrl: data.json?.['next_href'],
            fetchedItemsIds: data?.['fetchedItemsIds']
          })
        ),
        catchError(error =>
          of(
            genericPlaylistFetchMore.failure({
              error: handleEpicError(error),
              objectId,
              playlistType
            })
          )
        ),
        startWith(setPlaylistLoading({ objectId, playlistType }))
      );
    })
  );

export const getForYouSelectionEpic: RootEpic = action$ =>
  // @ts-ignore
  action$.pipe(
    filter(isActionOf(getForYouSelection.request)),
    tap(action => console.log(`${action.type} from ${process.type}`)),
    // map(action => action.payload),
    switchMap(() => {
      return from(APIService.fetchPersonalizedPlaylists()).pipe(
        map(json => {
          const collection = json.collection.filter(t => t.urn.indexOf('chart') === -1);

          const normalized = normalize<
            SoundCloud.Playlist,
            EntitiesOf<Omit<SoundCloud.Playlist, 'tracks'> & { tracks: Normalized.NormalizedResult[] }>,
            Array<Normalized.NormalizedPersonalizedItem>
          >(
            collection,
            new schema.Array(
              new schema.Object({
                items: {
                  collection: new schema.Array(playlistSchema)
                }
              })
            )
          );

          const objects: ForYourObject[] = [];

          normalized.result.forEach(playlistResult => {
            (playlistResult.items.collection || []).forEach(playlistId => {
              if (normalized.entities.playlistEntities && normalized.entities.playlistEntities[playlistId]) {
                const playlist = normalized.entities.playlistEntities[playlistId];

                objects.push({
                  playlistType: PlaylistTypes.PLAYLIST,
                  objectId: playlistId,
                  result: playlist.tracks || [],
                  fetchedItemsIds: [],
                  objectType: ObjectTypes.PLAYLISTS
                });
              }
            });
          });

          return getForYouSelection.success({
            objects,
            entities: normalized.entities,
            result: normalized.result
          });
        }),
        catchError(error =>
          of(
            getForYouSelection.failure({
              error: handleEpicError(error)
            })
          )
        )
      );
    })
  );

const processStreamItems = (state: RootState) => (json: Collection<APIService.FeedItem | APIService.PlaylistItem>) => {
  const {
    config: { hideReposts }
  } = state;

  const processedCollection = json.collection
    .filter(info => {
      if (hideReposts) {
        return !info.type.endsWith('repost');
      }

      // Filter out empty playlists
      return (info as APIService.FeedItem).track || (info.playlist && info.playlist.track_count);
    })
    .map(item => {
      const obj = (item as APIService.FeedItem).track || (item.playlist as SoundCloud.Playlist);

      obj.fromUser = item.user;
      obj.type = item.type;

      return obj;
    });

  const normalized = normalize<APIService.FeedItem, EntitiesOf<APIService.FeedItem>, Normalized.NormalizedResult[]>(
    processedCollection,
    new schema.Array(
      {
        tracks: trackSchema,
        playlists: playlistSchema,
        users: userSchema
      },
      input => `${input.kind}s`
    )
  );

  // Stream could have duplicate items
  normalized.result = uniqWith(normalized.result, isEqual);

  return {
    json,
    normalized
  };
};

const processLikeItems = (state: RootState) => (json: Collection<APIService.LikeItem>) => {
  const processedCollection = json.collection.map(({ track }) => track);
  const normalized = normalize<APIService.LikeItem, EntitiesOf<APIService.LikeItem>, Normalized.NormalizedResult[]>(
    processedCollection,
    new schema.Array(
      {
        tracks: trackSchema
      },
      input => `${input.kind}s`
    )
  );

  return {
    json,
    normalized
  };
};

const processMyTracks = (state: RootState) => (json: Collection<SoundCloud.Track>) => {
  const normalized = normalize<APIService.LikeItem, EntitiesOf<APIService.LikeItem>, Normalized.NormalizedResult[]>(
    json.collection,
    new schema.Array(
      {
        tracks: trackSchema
      },
      input => `${input.kind}s`
    )
  );

  return {
    json,
    normalized
  };
};
const processCharts = (state: RootState) => (json: Collection<APIService.ChartItem>) => {
  const processedCollection = json.collection.map(item => {
    const { track } = item;
    track.score = item.score;

    return track;
  });

  const normalized = normalize<APIService.ChartItem, EntitiesOf<APIService.ChartItem>, Normalized.NormalizedResult[]>(
    processedCollection,
    new schema.Array(
      {
        tracks: trackSchema
      },
      input => `${input.kind}s`
    )
  );

  return {
    json,
    normalized
  };
};

const processPlaylist = (state: RootState) => (json: SoundCloud.Playlist, objectId?: string) => {
  if (!objectId) {
    throw new Error(`processPlaylist: objectId=${objectId} must be defined`);
  }

  const normalized = normalize<SoundCloud.Playlist, EntitiesOf<SoundCloud.Playlist>, Normalized.NormalizedResult[]>(
    json,
    playlistSchema
  );

  if (normalized.entities && normalized.entities.playlistEntities) {
    const playlist = normalized.entities.playlistEntities[objectId];

    let fetchedItems: Partial<SoundCloud.Track>[] = [];

    if (json.tracks) {
      fetchedItems = json.tracks.filter((t: Partial<SoundCloud.Track>) => t.user !== undefined);
    }

    const fetchedItemsIds = fetchedItems.map(item => item.id);

    return {
      json,
      normalized: {
        ...normalized,
        result: playlist.tracks
      },
      fetchedItemsIds
    };
  }

  return {
    json,
    normalized
  };
};

const processPlaylistTracks = (state: RootState) => (json: SoundCloud.Track[], fetchedItemsIds: number[]) => {
  const normalized = normalize<SoundCloud.Track[], EntitiesOf<SoundCloud.Track>, Normalized.NormalizedResult[]>(
    json,
    new schema.Array(
      {
        tracks: trackSchema
      },
      input => `${input.kind}s`
    )
  );

  return {
    json,
    normalized,
    fetchedItemsIds
  };
};

const processCollection = (json: Collection<SoundCloud.All>) => {
  const normalized = normalize(
    json.collection,
    new schema.Array(
      {
        playlists: playlistSchema,
        tracks: trackSchema,
        users: userSchema
      },
      input => `${input.kind}s`
    )
  );

  return {
    json,
    normalized
  };
};
