import { handleEpicError } from '@common/utils/errors/EpicError';
import { concat, of } from 'rxjs';
import { catchError, exhaustMap, filter, map, pluck, withLatestFrom } from 'rxjs/operators';
import { isActionOf } from 'typesafe-actions';
import { RootEpic } from '../../../common/store/declarations';
import {
  getPlayingTrackIndex,
  getPlaylistsObjects,
  getUpNextSelector,
  isIndexInUpNextSelector,
  queuedTrackIndexSelector
} from '../../../common/store/selectors';
import { ObjectStateItem, PlaylistTypes } from '../../../common/store/types';
import {
  addUpNext,
  playTrackFromQueue,
  queueInsert,
  removeFromQueue,
  removeFromQueueOrUpNext,
  removeFromUpNext,
  startPlayMusic
} from '../../../common/store/player/actions';
import { upNextEndSelector } from '../../../common/store/player/selectors';

/**
 * If a track is played from the QUEUE, and the selected track is after the upNext.
 * UpNext should be inserted into the QUEUE before playing the music.
 */
export const playTrackFromQueueEpic: RootEpic = (action$, state$) =>
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(playTrackFromQueue)),
    pluck('payload'),
    withLatestFrom(state$),
    map(([payload, latestState]) => ({
      payload,
      playingTrackIndex: getPlayingTrackIndex(latestState),
      upNext: getUpNextSelector(latestState),
      upNextEndIndex: upNextEndSelector(latestState),
      isIndexInUpNext: isIndexInUpNextSelector(payload.index)(latestState),
      trackIndex: queuedTrackIndexSelector(payload.index)(latestState)
    })),
    exhaustMap(({ payload, upNextEndIndex, upNext, trackIndex, isIndexInUpNext, playingTrackIndex }) => {
      let upNextEndToAdd = 0;

      if (isIndexInUpNext) {
        upNextEndToAdd = trackIndex + 1;
      } else if (upNext.length && payload.index >= upNextEndIndex) {
        upNextEndToAdd = upNext.length;
      }

      return concat(
        // If there are items in upNext, we add the first one to our queue and remove them from upNext
        of(upNext).pipe(
          filter(() => !!upNextEndToAdd),
          map((upNext) => upNext.slice(0, upNextEndToAdd)),
          map((upNextItemsToAdd) => queueInsert({ items: upNextItemsToAdd, position: playingTrackIndex + 1 }))
        ),
        // Then start playing the track
        of(startPlayMusic({ idResult: payload.idResult }))
      );
    }),
    catchError(handleEpicError(action$, addUpNext.failure({})))
  );

/**
 * Add track or tracks from a playlist to the upNext
 */
export const addUpNextEpic: RootEpic = (action$, state$) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(addUpNext.request)),
    pluck('payload'),
    withLatestFrom(state$),
    map(([itemToAdd, latestState]) => ({
      itemToAdd,
      playlists: getPlaylistsObjects(latestState)
    })),
    map(({ itemToAdd, playlists }) => {
      // Replace playlists with their items
      const items = [itemToAdd].reduce<ObjectStateItem[]>((all, item) => {
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

      return addUpNext.success({ items });
    }),
    catchError(handleEpicError(action$, addUpNext.failure({})))
  );

/**
 * Removes a track using an index from either the QUEUE playlist or upNext
 */
export const removeFromQueueEpic: RootEpic = (action$, state$) =>
  // @ts-expect-error
  action$.pipe(
    filter(isActionOf(removeFromQueueOrUpNext)),
    pluck('payload'),
    withLatestFrom(state$),
    map(([itemIndex, state]) => ({
      isIndexInUpNext: isIndexInUpNextSelector(itemIndex)(state),
      trackIndex: queuedTrackIndexSelector(itemIndex)(state)
    })),
    exhaustMap(({ isIndexInUpNext, trackIndex }) => {
      if (isIndexInUpNext) {
        return of(removeFromUpNext(trackIndex));
      }

      return of(removeFromQueue(trackIndex));
    })
  );
