import { EVENTS, IMAGE_SIZES } from '@common/constants';
import { isMatchingPlaylistID, SC } from '@common/utils';
import { EpicError, handleEpicError } from '@common/utils/errors/EpicError';
import { Logger } from '@main/utils/logger';
import { SoundCloud } from '@types';
import { StoreState } from 'AppReduxTypes';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import _ from 'lodash';
import { StateObservable } from 'redux-observable';
import { concat, EMPTY, iif, merge, of, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  filter,
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
  changeTrack,
  genericPlaylistFetchMore,
  getPlaylistTracks,
  getTrack,
  playlistFinished,
  playPlaylist,
  playTrack,
  queueInsert,
  restartTrack,
  setConfigKey,
  setCurrentPlaylist,
  startPlayMusic,
  startPlayMusicIndex,
  toggleShuffle,
  toggleStatus,
  trackFinished
} from '../../../common/store/actions';
import { RootEpic } from '../../../common/store/declarations';
import { setCurrentIndex, shuffleQueue } from '../../../common/store/player/actions';
import {
  configSelector,
  getCurrentPlaylistId,
  getPlayerCurrentTime,
  getPlayingTrackIndex,
  getPlayingTrackSelector,
  getPlaylistEntity,
  getPlaylistObjectSelector,
  getPlaylistsObjects,
  getQueuePlaylistSelector,
  getQueueTrackByIndexSelector,
  getTrackEntity,
  getUpNextSelector,
  shuffleSelector
} from '../../../common/store/selectors';
import {
  ChangeTypes,
  ObjectStateItem,
  PlayerStatus,
  PlaylistIdentifier,
  PlaylistTypes,
  RepeatTypes
} from '../../../common/store/types';

const logger = Logger.createLogger('REDUX/PLAYER');

export const startPlayMusicEpic: RootEpic = (action$, state$) =>
  // @ts-ignore
  action$.pipe(
    filter(isActionOf(startPlayMusic)),
    pluck('payload'),
    withLatestFrom(state$),
    map(([payload, state]) => ({
      payload,
      currentPlaylistId: getCurrentPlaylistId(state),
      shuffle: shuffleSelector(state)
    })),
    mergeMap(({ payload, currentPlaylistId, shuffle }) => {
      const origin = payload.origin ?? currentPlaylistId;

      if (!origin) {
        return throwError(new EpicError('Unable to play music, no playlist found'));
      }

      return concat(
        of({}).pipe(
          // If origin is set, and not the same as the current playlist
          filter(
            () => !!payload.origin && (!currentPlaylistId || !isMatchingPlaylistID(payload.origin, currentPlaylistId))
          ),
          exhaustMap(() =>
            // Set current playlist and shuffle from current position is needed
            action$.pipe(
              filter(isActionOf(setCurrentPlaylist.success)),
              take(1),
              takeUntil(action$.pipe(filter(isActionOf([setCurrentPlaylist.failure])))),

              // Check if we need to shuffle this playlist
              filter((idResult) => shuffle && !!idResult),
              withLatestFrom(state$),
              map(([_, state]) => ({
                idResult: payload.idResult as ObjectStateItem,
                queueObject: getQueuePlaylistSelector(state)
              })),
              map(({ queueObject, idResult: { id, un } }) => {
                const currentTrackIndex = _.findIndex(
                  queueObject.items,
                  (item) => item.id === id && ((!!item.un && !!un && item.un === un) || (!item.un && !un))
                );

                return shuffleQueue({ fromIndex: currentTrackIndex + 1 });
              }),

              startWith(setCurrentPlaylist.request({ playlistId: origin })) // < -- Start here
            )
          )
        ),

        iif(
          () => !!payload.idResult,
          of(payload.idResult).pipe(
            filter((idResult): idResult is ObjectStateItem => !!idResult),
            mergeMap((idResult) =>
              concat(
                // Execute sub-action according to type of track or playlist
                // If it is a playlist we do playPlaylist, to try and fetch tracks, after this, we will do playTrack.
                // If it is a track, we just do playTrack.
                merge(
                  of(payload).pipe(
                    filter(() => idResult.schema === 'playlists'),
                    map(() =>
                      playPlaylist({
                        idResult,
                        origin,
                        changeType: payload.changeType,
                        nextPosition: payload.nextPosition
                      })
                    )
                  ),
                  of(payload).pipe(
                    filter(() => idResult?.schema === 'tracks'),
                    map(() =>
                      playTrack.request({
                        idResult,
                        origin,
                        nextPosition: payload.nextPosition
                      })
                    )
                  )
                )
              )
            )
          ),
          // If we did not pass idSchema, start first track
          of(payload.idResult).pipe(
            map(() => state$.value),
            map(getQueuePlaylistSelector),
            pluck('items'),
            filter((items) => items.length > 0),
            map((items) => items[0]),
            map((idResult) => playTrack.request({ idResult, origin }))
          )
        )
      );
    }),
    catchError(handleEpicError(action$, playTrack.failure({})))
  );

export const playTrackEpic: RootEpic = (action$, state$) =>
  // @ts-ignore
  action$.pipe(
    filter(isActionOf(playTrack.request)),
    pluck('payload'),
    switchMap(({ idResult, origin, nextPosition }) => {
      const { id, un, parentPlaylistID } = idResult;
      const currentPlaylistID: PlaylistIdentifier = parentPlaylistID ?? { playlistType: PlaylistTypes.QUEUE };

      return concat(
        // Check if track is fetched, otherwise fetch it
        // If the track is fetchable in the playlist, just fetch newer tracks. Otherwise just manually fetch it
        of({}).pipe(
          withLatestFrom(state$),
          map(([, latestState]) => {
            const playlistContainingTrack = getPlaylistObjectSelector(currentPlaylistID)(latestState);
            const track = getTrackEntity(id)(latestState);

            const toFetch = !!playlistContainingTrack?.itemsToFetch?.some((i) => i.id === id && i.schema === 'tracks');

            return { track, toFetch, playlistContainingTrack };
          }),
          // TODO: should we check if the track is fetched?
          filter(({ track, toFetch }) => !track || toFetch),
          tap(() =>
            logger.trace('playTrackEpic:: Track could not be found', {
              id,
              origin,
              currentPlaylistIdentifier: currentPlaylistID
            })
          ),
          mergeMap(({ toFetch }) => {
            if (toFetch) {
              return action$.pipe(
                filter(isActionOf(genericPlaylistFetchMore.success)),
                pluck('payload'),
                filter(({ playlistType, objectId }) => _.isEqual(currentPlaylistID, { playlistType, objectId })),
                take(1),
                takeUntil(action$.pipe(filter(isActionOf(genericPlaylistFetchMore.failure)))),
                ignoreElements(),
                tap(() =>
                  logger.trace('playTrackEpic:: Using generic fetch more to fetch track', {
                    id,
                    currentPlaylistIdentifier: currentPlaylistID
                  })
                ),
                startWith(genericPlaylistFetchMore.request(currentPlaylistID))
              );
            }

            return action$.pipe(
              filter(isActionOf(getTrack.success)),
              pluck('payload', 'trackId'),
              filter((trackId) => trackId === id),
              take(1),
              takeUntil(action$.pipe(filter(isActionOf(getTrack.failure)))),
              ignoreElements(),
              tap(() =>
                logger.trace('playTrackEpic:: Using getTrack to fetch track', {
                  id,
                  currentPlaylistIdentifier: currentPlaylistID
                })
              ),
              startWith(getTrack.request({ trackId: id, refresh: false }))
            );
          })
        ),

        // If the tracks exists, start playing
        // TODO: should we check if it is streamable??
        of({}).pipe(
          withLatestFrom(state$),
          map(([, latestState]) => ({
            track: getTrackEntity(id)(latestState),
            queueObject: getQueuePlaylistSelector(latestState)
          })),
          mergeMap(({ track, queueObject }) => {
            const position =
              nextPosition != null
                ? nextPosition
                : _.findIndex(
                    queueObject.items,
                    (item) => item.id === id && ((!!item.un && !!un && item.un === un) || (!item.un && !un))
                  );

            // TODO: what if position is -1?
            if (position === -1) {
              // TODO: what if it does not exist?
              logger.error('playTrackEpic:: Track not found in queue', {
                queueObject,
                id
              });
            }

            return of(
              playTrack.success({
                idResult,
                origin,
                parentPlaylistID,
                duration: (track?.duration ?? 0) / 1000,
                position
              })
            );
          })
        )
      );
    }),
    catchError(handleEpicError(action$, playTrack.failure({})))
  );

export const playPlaylistEpic: RootEpic = (action$, state$) =>
  // @ts-ignore
  action$.pipe(
    filter(isActionOf(playPlaylist)),
    pluck('payload'),
    switchMap(({ idResult, origin, changeType, nextPosition }) => {
      const { id } = idResult;
      const currentPlaylistIdentifier = { objectId: id.toString(), playlistType: PlaylistTypes.PLAYLIST };

      return concat(
        // Get tracks and wait for it to finish
        action$.pipe(
          filter(isActionOf(getPlaylistTracks.success)),
          pluck('payload'),
          filter((payload) => _.isEqual(currentPlaylistIdentifier, payload)),
          take(1),
          takeUntil(action$.pipe(filter(isActionOf(getPlaylistTracks.failure)))),

          startWith(getPlaylistTracks.request(currentPlaylistIdentifier)),

          withLatestFrom(state$),
          mergeMap(([, latestState]) => {
            console.log('ddddddd', currentPlaylistIdentifier.objectId);

            const playlist = getPlaylistObjectSelector(currentPlaylistIdentifier)(latestState);
            const p = getPlaylistEntity(currentPlaylistIdentifier.objectId)(latestState);

            console.log(p);
            console.log(playlist);

            if (!playlist?.items?.length) {
              // TODO: we cannot play this playlist, dispatch notification?
              logger.trace('playPlaylistEpic:: Playlist does not have any items', { id, playlist });
              return EMPTY;
            }
            const lastIndex = playlist?.items.length - 1;

            const { 0: firstItem, [lastIndex]: lastItem } = playlist?.items;

            const nextItem = changeType === ChangeTypes.PREV ? lastItem : firstItem;

            return of(
              playTrack.request({
                idResult: { ...nextItem, parentPlaylistID: currentPlaylistIdentifier },
                origin: currentPlaylistIdentifier,
                nextPosition
              })
            );
          })
        )

        // Get items, start playing first or last depending on changeType
        // of(currentPlaylistIdentifier).pipe()
      );
    }),
    catchError(handleEpicError(action$, playTrack.failure({})))
  );

export const changeTrackEpic: RootEpic = (action$, state$) =>
  // @ts-ignore
  action$.pipe(
    filter(isActionOf(changeTrack)),
    pluck('payload'),
    withLatestFrom(state$),
    map(([payload, state]) => ({
      payload,
      playingTrackIndex: getPlayingTrackIndex(state),
      queue: getQueuePlaylistSelector(state),
      currentTime: getPlayerCurrentTime(state),
      upNext: getUpNextSelector(state)
    })),
    switchMap(({ payload: { changeType }, playingTrackIndex, queue, currentTime, upNext }) => {
      let nextPosition = playingTrackIndex;

      if (changeType === ChangeTypes.NEXT) {
        // Increase index if we are not repeating
        nextPosition += 1;
      } else if (changeType === ChangeTypes.PREV && currentTime < 4) {
        // If currentTime lower than 4 seconds, play previous track
        nextPosition -= 1;
      } else {
        // If PREV and more than 4 seconds have played, restart track
        return of(restartTrack());
      }

      if (nextPosition < 0) nextPosition = 0;

      // If playlist is finished and not able to fetch more
      if (!upNext.length && nextPosition === queue.items.length && !queue.itemsToFetch.length && !queue.nextUrl) {
        return of(playlistFinished());
      }

      return concat(
        // If there are items in upNext, we add the first one to our queue
        of(upNext).pipe(
          filter((items) => items.length > 0),
          map(({ 0: firstItem }) => firstItem),
          map((firstItem) => queueInsert({ items: [firstItem], position: nextPosition }))
        ),
        of(startPlayMusicIndex({ index: nextPosition, changeType }))
      );
    }),
    catchError(handleEpicError(action$, playTrack.failure({})))
  );

export const playlistFinishedEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(playlistFinished)),
    withLatestFrom(state$),
    switchMap(([, state]) => {
      const { repeat } = configSelector(state);

      if (repeat == null) {
        return of(toggleStatus(PlayerStatus.PAUSED));
      }

      if (repeat === RepeatTypes.ALL) {
        return of(startPlayMusicIndex({ index: 0 }));
      }

      return ignoreElements();
    })
  );

export const trackFinishedEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(trackFinished)),
    withLatestFrom(state$),
    switchMap(([, state]) => {
      const { repeat } = configSelector(state);

      const shouldRepeat = repeat === RepeatTypes.ONE;

      if (shouldRepeat) {
        return of(restartTrack());
      }

      return of(changeTrack(ChangeTypes.NEXT));
    })
  );

export const startPlayMusicIndexEpic: RootEpic = (action$, state$) =>
  // @ts-ignore
  action$.pipe(
    filter(isActionOf(startPlayMusicIndex)),
    pluck('payload'),
    switchMap(({ index, changeType }) => {
      return concat(
        of(index).pipe(
          withLatestFrom(state$),
          map(([, latestState]) => getQueueTrackByIndexSelector(index)(latestState)),
          filter((nextTrack) => !nextTrack),
          mergeMap(() =>
            action$.pipe(
              filter(isActionOf(genericPlaylistFetchMore.success)),
              pluck('payload'),
              filter(({ playlistType }) => playlistType === PlaylistTypes.QUEUE),
              take(1),
              takeUntil(action$.pipe(filter(isActionOf(genericPlaylistFetchMore.failure)))),
              ignoreElements(),
              startWith(genericPlaylistFetchMore.request({ playlistType: PlaylistTypes.QUEUE }))
            )
          )
        ),
        of(index).pipe(
          withLatestFrom(state$),
          map(([, latestState]) => getQueueTrackByIndexSelector(index)(latestState)),
          mergeMap((nextTrack) => {
            if (!nextTrack) {
              // TODO: what if it still does not exist
              console.trace('startPlayMusicIndexEpic:: Track still does not exist', { index });

              return ignoreElements();
            }

            return of(
              startPlayMusic({
                idResult: nextTrack,
                changeType,
                nextPosition: index
              })
            );
          })
        )
      );
    }),
    catchError(handleEpicError(action$, playTrack.failure({})))
  );

export const setCurrentPlaylistEpic: RootEpic = (action$, state$) =>
  action$.pipe(
    filter(isActionOf(setCurrentPlaylist.request)),
    pluck('payload'),
    withLatestFrom(state$),
    map(([{ playlistId }, latestState]) => ({
      playlistId,
      playlistObject: getPlaylistObjectSelector(playlistId)(latestState),
      playlists: getPlaylistsObjects(latestState)
    })),
    filter(({ playlistObject }) => !!playlistObject),
    exhaustMap(({ playlistId, playlistObject, playlists }) => {
      console.log('setCurrentPlaylist');

      // Replace playlists with their items
      const items = (playlistObject?.items ?? []).reduce<ObjectStateItem[]>((all, item) => {
        if (item.schema === 'playlists') {
          const playlistExists = playlists[item.id];

          if (playlistExists) {
            all.push(
              ...[...playlistExists.items, ...playlistExists.itemsToFetch].map(
                (i): ObjectStateItem => ({
                  ...i,
                  parentPlaylistID: {
                    objectId: item.id.toString(),
                    playlistType: PlaylistTypes.PLAYLIST
                  },
                  un: item.un
                })
              )
            );
          } else {
            all.push(item);
          }
        } else {
          all.push(item);
        }

        return all;
      }, []);

      return of(setCurrentPlaylist.success({ items, playlistId }));
    }),
    catchError(handleEpicError(action$, setCurrentPlaylist.failure({})))
  );

// Toggle shuffle
export const toggleShuffleEpic: RootEpic = (action$, state$) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment

  action$.pipe(
    filter(isActionOf(toggleShuffle)),
    pluck('payload'),
    switchMap((shuffle) =>
      merge(
        of(setConfigKey('shuffle', shuffle)),
        // If shuffle, shuffle queue starting from index
        of(shuffle).pipe(
          filter(Boolean),
          map(() => state$.value),
          map(getPlayingTrackIndex),
          map((fromIndex) => ({ fromIndex: fromIndex + 1 })),
          map(shuffleQueue)
        ),
        of(shuffle).pipe(
          filter((isShuffling) => !isShuffling),
          map(() => state$.value),
          map(getCurrentPlaylistId),
          filter((currentPlaylistID): currentPlaylistID is PlaylistIdentifier => !!currentPlaylistID),
          mergeMap((currentPlaylistID) =>
            concat(
              merge(
                of(setCurrentPlaylist.request({ playlistId: currentPlaylistID })),
                action$.pipe(
                  filter(isActionOf(setCurrentPlaylist.success)),
                  pluck('payload'),
                  take(1),
                  takeUntil(action$.pipe(filter(isActionOf(setCurrentPlaylist.failure)))),
                  ignoreElements()
                )
              ),
              recalculateCurrentIndex(state$)
            )
          )
        )
      )
    )
  );

const recalculateCurrentIndex = (state$: StateObservable<StoreState>) =>
  of(state$.value).pipe(
    map((state) => {
      const currentPlaylistID = getCurrentPlaylistId(state);
      return {
        currentPlaylist: currentPlaylistID ? getPlaylistObjectSelector(currentPlaylistID)(state) : null,
        playingTrack: getPlayingTrackSelector(state)
      };
    }),
    filter(({ playingTrack, currentPlaylist }) => !!playingTrack && !!currentPlaylist),
    map(({ playingTrack, currentPlaylist }) => {
      const { id, un } = playingTrack ?? {};

      const currentTrackIndex = _.findIndex(
        currentPlaylist?.items ?? [],
        (item) => item.id === id && ((!!item.un && !!un && item.un === un) || (!item.un && !un))
      );

      return currentTrackIndex;
    }),
    filter((currentTrackIndex) => currentTrackIndex !== -1),
    map((currentTrackIndex) => setCurrentIndex({ position: currentTrackIndex }))
  );

export const trackChangeNotificationEpic: RootEpic = (action$, state$) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(startPlayMusic)),
    pluck('payload'),
    filter(({ idResult }) => !!idResult),
    distinctUntilChanged(),
    debounceTime(500),
    withLatestFrom(state$),
    map(([payload, state]) => ({
      track: getTrackEntity(payload.idResult?.id as number)(state),
      shouldShowNotification: state.config.app.showTrackChangeNotification && !document.hasFocus()
    })),
    filter(({ shouldShowNotification, track }) => shouldShowNotification && !!track),
    pluck('track'),
    tap<SoundCloud.Track>((track) => {
      const myNotification = new Notification(track.title, {
        body: `${track.user && track.user.username ? track.user.username : ''}`,
        icon: SC.getImageUrl(track, IMAGE_SIZES.SMALL),
        silent: true
      });

      myNotification.onclick = () => {
        ipcRenderer.send(EVENTS.APP.RAISE);
      };
    }),
    ignoreElements()
  );
