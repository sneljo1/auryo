import { normalizeArray, normalizeCollection, playlistSchema } from '@common/schemas';
import { SC } from '@common/utils';
import { EpicError, handleEpicError } from '@common/utils/errors/EpicError';
import { Collection, EntitiesOf, Normalized, SoundCloud } from '@types';
import { RootAction, StoreState } from 'AppReduxTypes';
import _, { isEqual, uniqWith } from 'lodash';
import { normalize, schema } from 'normalizr';
import { ActionsObservable, StateObservable } from 'redux-observable';
import { concat, defer, EMPTY, from, merge, of, throwError } from 'rxjs';
import {
  catchError,
  delay,
  distinctUntilChanged,
  exhaustMap,
  filter,
  first,
  ignoreElements,
  map,
  mergeMap,
  pluck,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import {
  ForYourObject,
  genericPlaylistFetchMore,
  getForYouSelection,
  getGenericPlaylist,
  getPlaylistTracks,
  getSearchPlaylist,
  resolvePlaylistItems,
  searchPlaylistFetchMore,
  setPlaylistLoading
} from '../actions';
import * as APIService from '../api';
import { RootEpic } from '../declarations';
import { ObjectState, ObjectStateItem } from '../objects';
import {
  currentUserSelector,
  getPlaylistObjectSelector,
  getQueuePlaylistSelector,
  shuffleSelector
} from '../selectors';
import { ObjectTypes, PlaylistTypes } from '../types';
import { PlaylistIdentifier } from './types';

export const getGenericPlaylistEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(getGenericPlaylist.request)),
    pluck('payload'),
    withLatestFrom(state$),
    switchMap(([{ playlistType, objectId, refresh, sortType }, state]) => {
      const {
        config: { hideReposts }
      } = state;
      const me = currentUserSelector(state);

      return defer(() => {
        let ob$;

        switch (playlistType) {
          case PlaylistTypes.STREAM:
            ob$ = APIService.fetchStream({ limit: hideReposts ? 42 : 21 });
            break;
          case PlaylistTypes.LIKES:
            ob$ = APIService.fetchMyLikes({ limit: 21 });
            break;
          case PlaylistTypes.MYTRACKS:
            ob$ = APIService.fetchMyTracks({ limit: 21 });
            break;
          case PlaylistTypes.MYPLAYLISTS:
            ob$ = APIService.fetchPlaylists({ limit: 21 });
            break;
          case PlaylistTypes.RELATED:
            if (!objectId) {
              ob$ = throwError(new Error(`${playlistType}: objectId=${objectId} must be defined`));
              break;
            }
            ob$ = APIService.fetchRelatedTracks({ limit: 21, trackId: objectId });
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
          case PlaylistTypes.ARTIST_TRACKS:
            if (!objectId) {
              ob$ = throwError(new Error(`${playlistType}: objectId=${objectId} must be defined`));
              break;
            }
            ob$ = APIService.fetchUserTracks({ limit: 21, userId: objectId });
            break;
          case PlaylistTypes.ARTIST_TOP_TRACKS:
            if (!objectId) {
              ob$ = throwError(new Error(`${playlistType}: objectId=${objectId} must be defined`));
              break;
            }
            ob$ = APIService.fetchUserTopTracks({ limit: 21, userId: objectId });
            break;
          case PlaylistTypes.ARTIST_LIKES:
            if (!objectId) {
              ob$ = throwError(new Error(`${playlistType}: objectId=${objectId} must be defined`));
              break;
            }
            ob$ = APIService.fetchUserLikes({ limit: 21, userId: objectId });
            break;
          default:
            ob$ = throwError(new EpicError(`${playlistType}: ${objectId} not found`));
        }

        return ob$;
      }).pipe(
        map(json => {
          switch (playlistType) {
            case PlaylistTypes.STREAM:
              return processStreamItems(state)(json as Collection<APIService.FeedItem>);
            case PlaylistTypes.LIKES:
            case PlaylistTypes.ARTIST_LIKES:
              return processLikeItems(state)(json as Collection<SoundCloud.Track>);
            case PlaylistTypes.MYTRACKS:
            case PlaylistTypes.RELATED:
            case PlaylistTypes.ARTIST_TRACKS:
            case PlaylistTypes.ARTIST_TOP_TRACKS:
              return processTracks(state)(json as Collection<SoundCloud.Track>);
            case PlaylistTypes.MYPLAYLISTS:
              return processStreamItems(state)(json as Collection<APIService.PlaylistItem>);
            case PlaylistTypes.PLAYLIST:
              return processPlaylist(state)(json as SoundCloud.Playlist, objectId);
            case PlaylistTypes.CHART:
              return processCharts(state)(json as Collection<APIService.ChartItem>);
            default:
              return {
                json,
                normalized: normalize<any, EntitiesOf<any>, Normalized.NormalizedResult[]>(json, playlistSchema)
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
            nextUrl: data.json?.next_href,
            fetchedItemsIds: data?.fetchedItemsIds
          })
        ),
        catchError(
          handleEpicError(
            action$,
            getGenericPlaylist.failure({
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
        object,

        // For our queue, we keep the origin playlistId here
        originalPlaylistType: object?.meta.originalPlaylistID?.playlistType ?? playlistType
      };
    }),
    // Don't do anything if we are already fetching this playlist
    filter(({ object, originalPlaylistType }) => {
      if (originalPlaylistType !== PlaylistTypes.PLAYLIST) {
        return !!object && !object.isFetching && !!object.nextUrl;
      }

      return !!object && !object.isFetching && !!object.itemsToFetch.length;
    }),
    withLatestFrom(state$),
    switchMap(([{ object, payload, originalPlaylistType }, state]) => {
      const { playlistType, objectId } = payload;
      const shuffle = shuffleSelector(state);
      const urlWithToken = SC.appendToken(object?.nextUrl as string);
      const itemsToFetch = (object?.itemsToFetch.map(i => i.id) || []).slice(0, 15);

      return defer(() => {
        let ob$;

        if (originalPlaylistType === PlaylistTypes.PLAYLIST) {
          ob$ = APIService.fetchTracks({ ids: itemsToFetch });
        } else {
          ob$ = APIService.fetchFromUrl<any>(urlWithToken);
        }

        return ob$;
      }).pipe(
        map(json => {
          switch (originalPlaylistType) {
            case PlaylistTypes.STREAM:
              return processStreamItems(state)(json);
            case PlaylistTypes.LIKES:
            case PlaylistTypes.ARTIST_LIKES:
              return processLikeItems(state)(json);
            case PlaylistTypes.MYTRACKS:
            case PlaylistTypes.RELATED:
            case PlaylistTypes.ARTIST_TRACKS:
            case PlaylistTypes.ARTIST_TOP_TRACKS:
              return processTracks(state)(json);
            case PlaylistTypes.MYPLAYLISTS:
              return processStreamItems(state)(json);
            case PlaylistTypes.PLAYLIST:
              return processPlaylistTracks(json, itemsToFetch);
            case PlaylistTypes.CHART:
              return processCharts(state)(json);
            default:
              return {
                json,
                normalized: normalize<any, EntitiesOf<any>, Normalized.NormalizedResult[]>(json, playlistSchema)
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
            nextUrl: data.json?.next_href,
            fetchedItemsIds: data?.fetchedItemsIds,
            shuffle
          })
        ),
        startWith(setPlaylistLoading({ objectId, playlistType })),

        catchError(
          handleEpicError(
            action$,
            genericPlaylistFetchMore.failure({
              objectId,
              playlistType
            })
          )
        )
      );
    })
  );

export const searchEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(getSearchPlaylist)),
    tap(action => console.log(`${action.type} from ${process.type}`)),
    pluck('payload'),
    switchMap(({ playlistType, objectId, query, tag, refresh }) => {
      // TODO
      // if (query && isSoundCloudUrl(query)) {
      //   return Promise.resolve(tryAndResolveQueryAsSoundCloudUrl(query, dispatch)) as any;
      // }

      return defer(() => {
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
            }
            break;
          case PlaylistTypes.SEARCH_USER:
            if (query && query.length) {
              ob$ = APIService.searchAll({ query, limit: 21, type: 'users' });
            }
            break;
          default:
        }

        return ob$ ?? EMPTY;
      }).pipe(
        map(data => normalizeCollection(data)),
        map(data =>
          getGenericPlaylist.success({
            objectId,
            playlistType,
            objectType: ObjectTypes.PLAYLISTS,
            entities: data.normalized.entities,
            result: data.normalized.result,
            refresh,
            nextUrl: data.json?.next_href,
            fetchedItemsIds: data?.fetchedItemsIds,
            query: query || tag
          })
        ),
        catchError(
          handleEpicError(
            action$,
            getGenericPlaylist.failure({
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

      return {
        payload,
        object: getPlaylistObjectSelector({ objectId, playlistType })(state)
      };
    }),
    // Don't do anything if we are already fetching this playlist
    filter(({ object }) => !!object && !object.isFetching && !!object.nextUrl),
    switchMap(({ object, payload }) => {
      const { playlistType, objectId } = payload;
      const urlWithToken = SC.appendToken(object?.nextUrl as string);

      return defer(() => from(APIService.fetchFromUrl<any>(urlWithToken))).pipe(
        map(normalizeCollection),
        map(data =>
          genericPlaylistFetchMore.success({
            objectId,
            playlistType,
            entities: data.normalized.entities,
            objectType: ObjectTypes.PLAYLISTS,
            result: data.normalized.result,
            nextUrl: data.json?.next_href,
            fetchedItemsIds: data?.fetchedItemsIds
          })
        ),
        startWith(setPlaylistLoading({ objectId, playlistType })),

        catchError(
          handleEpicError(
            action$,
            genericPlaylistFetchMore.failure({
              objectId,
              playlistType
            })
          )
        )
      );
    })
  );

export const getForYouSelectionEpic: RootEpic = action$ =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(getForYouSelection.request)),
    tap(action => console.log(`${action.type} from ${process.type}`)),
    // map(action => action.payload),
    switchMap(() => {
      return defer(() => from(APIService.fetchPersonalizedPlaylists())).pipe(
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

        catchError(handleEpicError(action$, getForYouSelection.failure({})))
      );
    })
  );

export const getPlaylistTracksEpic: RootEpic = (action$, state$) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  action$.pipe(
    // For playlists in playlists (playlist in STREAM for ex), we need to check if an object exists for this playlist,
    // Otherwise we cannot do much, so we wait for it and create it
    filter(isActionOf(getPlaylistTracks.request)),
    pluck('payload'),
    mergeMap(payload => {
      const { objectId, playlistType } = payload;

      return concat(
        createPlaylistIfNotExists$(action$, state$, payload),
        state$.pipe(
          // Wait for the playlist to exist
          map(getPlaylistObjectSelector(payload)),
          distinctUntilChanged(),
          filter(object => !!object),
          first(),

          // Fetch all tracks
          mergeMap(object =>
            merge(
              from(_.chunk(object?.itemsToFetch.map(i => i.id) || [], 50)).pipe(
                mergeMap(itemsForThisChunk =>
                  defer(() => from(APIService.fetchTracks({ ids: itemsForThisChunk }))).pipe(
                    map(json => processPlaylistTracks(json, itemsForThisChunk)),
                    map(data =>
                      genericPlaylistFetchMore.success({
                        objectId,
                        playlistType,
                        entities: data.normalized.entities,
                        objectType: ObjectTypes.PLAYLISTS,
                        result: data.normalized.result,
                        nextUrl: data.json?.next_href,
                        fetchedItemsIds: data?.fetchedItemsIds
                      })
                    ),
                    catchError(handleEpicError(action$))
                  )
                )
              )
            )
          ),
          catchError(
            handleEpicError(
              action$,
              getPlaylistTracks.failure({
                objectId,
                playlistType
              })
            )
          )
        ),
        of(getPlaylistTracks.success(payload))
      );
    })
  );

export const createPlaylistObjectsEpic: RootEpic = (action$, state$) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf([getGenericPlaylist.success, genericPlaylistFetchMore.success])),
    delay(250),
    pluck('payload', 'result'),
    mergeMap(result =>
      merge(
        from(result).pipe(
          filter(item => item.schema === 'playlists'),
          mergeMap(({ id }) =>
            createPlaylistIfNotExists$(action$, state$, {
              objectId: id.toString(),
              playlistType: PlaylistTypes.PLAYLIST
            })
          )
        )
      )
    )
  );

const createPlaylistIfNotExists$ = (
  action$: ActionsObservable<RootAction>,
  state$: StateObservable<StoreState>,
  payload: PlaylistIdentifier
) =>
  of(payload).pipe(
    withLatestFrom(state$),
    map(([playlistID, state]) => ({
      playlistID,
      objectExists: getPlaylistObjectSelector(playlistID)(state)
    })),
    filter(({ objectExists }) => !objectExists),
    exhaustMap(({ playlistID }) =>
      concat(
        action$.pipe(
          filter(isActionOf(getGenericPlaylist.success)),
          pluck('payload'),
          filterPlaylistID$(playlistID),
          take(1),
          takeUntil(
            action$.pipe(
              filter(isActionOf(getGenericPlaylist.failure)),
              pluck('payload'),
              filterPlaylistID$(playlistID)
            )
          ),
          ignoreElements(),
          startWith(
            getGenericPlaylist.request({
              ...playlistID,
              refresh: true
            })
          )
        ),
        of(state$.value).pipe(
          filter(() => !!playlistID.objectId),
          map(getQueuePlaylistSelector),
          map(queueObject =>
            playlistID?.objectId
              ? queueObject.items.filter(i => i.schema === 'playlists' && i.id.toString() === playlistID.objectId)
              : []
          ),
          filter(playlistItemsToReplace => !!playlistItemsToReplace.length),
          withLatestFrom(state$),
          map(([playlistItemsToReplace, latestState]) => ({
            object: getPlaylistObjectSelector(playlistID)(latestState),
            playlistItemsToReplace
          })),
          filter(({ object }) => !!object),
          mergeMap(({ playlistItemsToReplace, object }) =>
            concat(
              from(playlistItemsToReplace).pipe(
                map(playlistItem =>
                  resolvePlaylistItems({
                    playlistItem,
                    items: [...(object as ObjectState).items, ...(object as ObjectState).itemsToFetch].map(
                      (i): ObjectStateItem => ({
                        ...i,
                        parentPlaylistID: {
                          objectId: playlistItem.id.toString(),
                          playlistType: PlaylistTypes.PLAYLIST
                        },
                        un: playlistItem.un
                      })
                    )
                  })
                )
              )
            )
          )
        )
      )
    )
  );

const filterPlaylistID$ = (playlistID: PlaylistIdentifier) =>
  filter(({ playlistType, objectId }: PlaylistIdentifier) => _.isEqual(playlistID, { playlistType, objectId }));

const processStreamItems = (state: StoreState) => (json: Collection<APIService.FeedItem | APIService.PlaylistItem>) => {
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

      obj.fromUser = item.user as any;
      obj.type = item.type;

      return obj;
    });

  const { normalized } = normalizeArray<SoundCloud.Track | SoundCloud.Playlist>(processedCollection);

  // Stream could have duplicate items
  normalized.result = uniqWith(normalized.result, isEqual);

  return {
    json,
    normalized
  };
};

const processLikeItems = (_state: StoreState) => (json: Collection<SoundCloud.Track>) => {
  return normalizeCollection<SoundCloud.Track>(json);
};

const processTracks = (_state: StoreState) => (json: Collection<SoundCloud.Track>) => {
  return normalizeCollection<SoundCloud.Track>(json);
};

const processCharts = (_state: StoreState) => (json: Collection<APIService.ChartItem>) => {
  const processedCollection = json.collection.map(item => {
    const { track } = item;
    track.score = item.score;

    return track;
  });

  return normalizeCollection<SoundCloud.Track>({
    ...json,
    collection: processedCollection
  });
};

const processPlaylist = (_state: StoreState) => (json: SoundCloud.Playlist, objectId?: string) => {
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

    const fetchedItemsIds = fetchedItems.map(item => item.id as number);

    return {
      json,
      normalized: {
        ...normalized,
        result: playlist.tracks as any
      },
      fetchedItemsIds
    };
  }

  return {
    json,
    normalized
  };
};

const processPlaylistTracks = (json: SoundCloud.Track[], fetchedItemsIds: number[]) => {
  const { normalized } = normalizeArray<SoundCloud.Track>(json);

  return {
    json,
    normalized,
    fetchedItemsIds
  };
};
