import { Intent } from '@blueprintjs/core';
import _ from 'lodash';
import { action } from 'typesafe-actions';
import { ThunkResult } from '..';
import { Normalized, SoundCloud } from '../../../types';
import { getCurrentPosition } from '../../utils/playerUtils';
import * as SC from '../../utils/soundcloudUtils';
import { getPlaylistEntity, getTrackEntity } from '../entities/selectors';
import { EntitiesState } from '../entities/types';
// eslint-disable-next-line import/no-cycle
import { fetchMore, fetchPlaylistIfNeeded, fetchPlaylistTracks, fetchTracks } from '../objects/actions';
import { getPlaylistObjectSelector, getPlaylistType } from '../objects/selectors';
import { ObjectsActionTypes, ObjectTypes, PlaylistTypes } from '../objects/types';
import { addToast } from '../ui/actions';
import {
  ChangeTypes,
  PlayerActionTypes,
  PlayerStatus,
  PlayingPositionState,
  PlayingTrack,
  ProcessedQueueItems,
  RepeatTypes
} from './types';
import { axiosClient } from '@common/api/helpers/axiosClient';

export const setCurrentTime = (time: number) => action(PlayerActionTypes.SET_TIME, { time });
export const setDuration = (time: number) => action(PlayerActionTypes.SET_DURATION, { time });
export const toggleShuffle = (value: boolean) => action(PlayerActionTypes.TOGGLE_SHUFFLE, { value });
export const clearUpNext = () => action(PlayerActionTypes.CLEAR_UP_NEXT);

export function getPlaylistObject(playlistId: string, position: number): ThunkResult<Promise<any>> {
  return async (dispatch, getState) => {
    const state = getState();

    const {
      player: { containsPlaylists }
    } = state;

    const playlistObject = getPlaylistObjectSelector(playlistId)(state);

    if (!playlistObject) {
      const result: any = await dispatch<Promise<any>>(fetchPlaylistIfNeeded(+playlistId));

      const currentPlaylistObject = getPlaylistObjectSelector(playlistId)(state);
      const currentPlaylistEntity = getPlaylistEntity(+playlistId)(state);

      if (currentPlaylistObject) {
        if (
          currentPlaylistEntity &&
          !currentPlaylistObject.isFetching &&
          ((currentPlaylistObject.items.length === 0 && currentPlaylistEntity.duration === 0) ||
            currentPlaylistEntity.track_count === 0)
        ) {
          throw new Error('This playlist is empty or not available via a third party!');
        }

        // Fetch more tracks
        if (currentPlaylistObject.fetchedItems < currentPlaylistObject.items.length) {
          dispatch(fetchPlaylistTracks(+playlistId, 50));
        }
      }

      return result;
    }

    const playlistInQueue = containsPlaylists.find(p => position > p.start && position < p.end);

    if (playlistInQueue) {
      const queuePlaylistObject = getPlaylistObjectSelector(playlistInQueue.id.toString())(state);

      if (queuePlaylistObject) {
        /**
         * If amount of fetched items - 25 is in the visible queue, fetch more tracks
         */
        if (
          position > playlistInQueue.start + queuePlaylistObject.fetchedItems - 25 &&
          !queuePlaylistObject.isFetching
        ) {
          dispatch(fetchPlaylistTracks(playlistInQueue.id, 50));
        }
      }
    }

    return null;
  };
}

export function registerPlay(): ThunkResult<void> {
  return async (_dispatch, getState) => {
    const {
      player: { playingTrack }
    } = getState();

    if (playingTrack) {
      const { id, playlistId } = playingTrack;

      const params: any = {
        track_urn: `soundcloud:tracks:${id}`
      };

      await import('@common/utils/universalAnalytics').then(({ ua }) => {
        ua.event('SoundCloud', 'Play', '', id).send();
      });

      const type = getPlaylistType(playlistId);

      if ((!type || !(type in PlaylistTypes)) && typeof playlistId !== 'string') {
        params.context_urn = `soundcloud:playlists:${playlistId}`;
      }

      await axiosClient.request({
        url: SC.registerPlayUrl(),
        method: 'POST',
        data: params
      });
    }
  };
}

/**
 * Set currentrackIndex & start playing
 */
export function setPlayingTrack(nextTrack: PlayingTrack, position: number, changeType?: ChangeTypes): ThunkResult<any> {
  return (dispatch, getState) => {
    const {
      config: { repeat }
    } = getState();

    const track = getTrackEntity(nextTrack.id)(getState());

    if (track && !SC.isStreamable(track)) {
      if (changeType && changeType in Object.values(ChangeTypes)) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        changeTrack(changeType);
      }
    }

    dispatch({
      type: PlayerActionTypes.SET_TRACK,
      payload: {
        nextTrack,
        status: PlayerStatus.PLAYING,
        position,
        repeat: repeat === RepeatTypes.ONE
      }
    });
  };
}

export function getItemsAround(position: number): ThunkResult<Promise<void>> {
  return async (dispatch, getState) => {
    const {
      player: { queue, currentPlaylistId }
    } = getState();

    if (currentPlaylistId) {
      const currentPlaylist = getPlaylistObjectSelector(currentPlaylistId)(getState());

      const itemsToFetch: { position: number; id: number }[] = [];

      const lowBound = position - 3;
      const highBound = position + 3;

      // Get playlists
      for (let i = lowBound < 0 ? 0 : position; i < (highBound > queue.length ? queue.length : highBound); i += 1) {
        const queueItem = queue[i];

        if (queueItem && queueItem.id) {
          const playlist = getPlaylistEntity(+queueItem.playlistId)(getState());

          if (playlist) {
            dispatch(getPlaylistObject(queueItem.playlistId, i));
          }

          const track = getTrackEntity(queueItem.id)(getState());

          if (!track || (track && !track.title && !track.loading)) {
            itemsToFetch.push({
              position: i,
              id: queueItem.id
            });
          }

          if (
            currentPlaylist &&
            currentPlaylist.fetchedItems &&
            currentPlaylist.fetchedItems - 10 < i &&
            currentPlaylist.fetchedItems !== currentPlaylist.items.length
          ) {
            dispatch(fetchPlaylistTracks(+currentPlaylistId, 30));
          }
        }
      }

      if (itemsToFetch.length) {
        const response = await dispatch<Promise<{ value: { entities: EntitiesState } }>>(
          fetchTracks(itemsToFetch.map(i => i.id)) as any
        );

        const {
          value: {
            entities: { trackEntities = {} }
          }
        } = response;

        // SoundCloud sometimes returns 404 for some tracks, if this happens, we clear it in our app
        itemsToFetch.forEach(i => {
          if (!trackEntities[i.id]) {
            const queueItem = queue[i.position];

            dispatch({
              type: ObjectsActionTypes.UNSET_TRACK,
              payload: {
                trackId: i.id,
                position: i.position,
                objectId: queueItem.playlistId,
                entities: {
                  trackEntities: {
                    [i.id]: undefined
                  }
                }
              }
            });
          }
        });
      }
    }
  };
}

/**
 * Update queue when scrolling through
 */
export function updateQueue(range: number[]): ThunkResult<void> {
  return (dispatch, getState) => {
    const { player } = getState();

    const { queue, currentPlaylistId } = player;

    if (currentPlaylistId) {
      if (queue.length < range[1] + 5) {
        dispatch(fetchMore(currentPlaylistId, ObjectTypes.PLAYLISTS));
      }

      dispatch(getItemsAround(range[1]));
    }
  };
}

export function processQueueItems(
  result: Normalized.NormalizedResult[],
  keepFirst = false,
  newPlaylistId?: string
): ThunkResult<Promise<ProcessedQueueItems>> {
  return async (dispatch, getState) => {
    const {
      player: { currentPlaylistId },
      config: { shuffle }
    } = getState();

    if (!currentPlaylistId && !newPlaylistId) {
      return [[], []];
    }

    const currentPlaylist = newPlaylistId || (currentPlaylistId as string);

    const items = await Promise.all(
      result
        .filter(trackIdSchema => trackIdSchema && trackIdSchema.schema !== 'users')
        .map(
          async (trackIdSchema): Promise<PlayingTrack | null | (PlayingTrack | null)[]> => {
            const { id } = trackIdSchema;

            const playlist = getPlaylistEntity(id)(getState());
            const playlistObject = getPlaylistObjectSelector(id.toString())(getState());

            if (playlist) {
              if (!playlistObject) {
                dispatch(fetchPlaylistIfNeeded(id));
              } else {
                return playlistObject.items.map((trackIdResult): PlayingTrack | null => {
                  const trackId = trackIdResult.id;
                  const track = getTrackEntity(id)(getState());

                  if (track && !SC.isStreamable(track)) {
                    return null;
                  }

                  return {
                    id: trackId,
                    playlistId: id.toString(),
                    un: Date.now()
                  };
                });
              }

              return null;
            }

            const track = getTrackEntity(id)(getState());

            if (track && !SC.isStreamable(track)) {
              return null;
            }

            return {
              id,
              playlistId: currentPlaylist.toString(),
              un: Date.now()
            };
          }
        )
    );

    const flattened = _.flatten(items).filter((t): t is PlayingTrack => !!t);

    if (keepFirst) {
      const [firstItem, ...rest] = flattened;
      const processedRest = shuffle ? _.shuffle(rest) : rest;

      return [[firstItem, ...processedRest], flattened];
    }

    const processedItems = shuffle ? _.shuffle(flattened) : flattened;

    return [processedItems, flattened];
  };
}

/**
 * Set new playlist as first or add a playlist if it doesn't exist yet
 */
export function setCurrentPlaylist(playlistId: string, nextTrack: PlayingTrack | null): ThunkResult<Promise<any>> {
  return async (dispatch, getState) => {
    const state = getState();

    const {
      player: { currentPlaylistId }
    } = state;

    const playlistObject = getPlaylistObjectSelector(playlistId.toString())(state);

    const containsPlaylists: PlayingPositionState[] = [];

    if (playlistObject && (nextTrack || playlistId !== currentPlaylistId)) {
      const [items, originalItems] = await dispatch<Promise<ProcessedQueueItems>>(
        processQueueItems(playlistObject.items, true, playlistId)
      );

      if (nextTrack && !nextTrack.id) {
        await dispatch<Promise<any>>(fetchPlaylistIfNeeded(+nextTrack.playlistId));
      }

      return dispatch<Promise<any>>({
        type: PlayerActionTypes.SET_PLAYLIST,
        payload: {
          promise: Promise.resolve({
            playlistId,
            items,
            originalItems,
            nextTrack,
            containsPlaylists
          })
        }
      } as any);
    }

    return Promise.resolve();
  };
}

/**
 * Function for playing a new track or playlist
 *
 * Before playing the current track, check if the track passed to the function is a playlist. If so, save the parent
 * playlist and execute the function with the child playlist. If the new playlist doesn't exist, fetch it before moving on.
 */

interface Next {
  id: number;
  playlistId?: string;
}

export function playTrack(
  playlistId: string,
  next?: Next,
  forceSetPlaylist = false,
  changeType?: ChangeTypes
): ThunkResult<any> {
  // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
  return async (dispatch, getState) => {
    const {
      player: { currentPlaylistId }
    } = getState();

    let nextTrack: PlayingTrack = next as PlayingTrack;

    if (!next) {
      const object = getPlaylistObjectSelector(playlistId)(getState());

      if (object) {
        // tslint:disable-next-line: no-parameter-reassignment
        nextTrack = {
          playlistId: playlistId.toString(),
          id: object.items[0].id,
          un: Date.now()
        };
      }
    } else if (!next.playlistId) {
      nextTrack.playlistId = playlistId.toString();
    }

    /**
     * If playlist isn't current, set current & add items to queue
     */

    if (currentPlaylistId !== playlistId || forceSetPlaylist) {
      await dispatch<Promise<any>>(setCurrentPlaylist(playlistId, forceSetPlaylist && nextTrack ? nextTrack : null));
    }

    const state = getState();

    const {
      player: { queue }
    } = state;

    let position = getCurrentPosition({ queue, playingTrack: nextTrack });

    if (position !== -1) {
      dispatch(getItemsAround(position));
    }

    // We know the id, just set the track
    if (nextTrack.id) {
      const trackPlaylistObject = getPlaylistObjectSelector(playlistId)(state);

      if (trackPlaylistObject && position + 10 >= queue.length && trackPlaylistObject.nextUrl) {
        await dispatch<Promise<any>>(fetchMore(playlistId, ObjectTypes.PLAYLISTS));
      }

      dispatch(setPlayingTrack(nextTrack, position, changeType));

      // No id is given, this means we want to play a playlist
    } else if (!nextTrack.id) {
      const trackPlaylistObject = getPlaylistObjectSelector(nextTrack.playlistId)(state);
      const playlistEntitity = getPlaylistEntity(+nextTrack.playlistId)(state);

      if (!trackPlaylistObject) {
        if (playlistEntitity && playlistEntitity.track_count > 0) {
          await dispatch<Promise<any>>(getPlaylistObject(nextTrack.playlistId, 0));

          const { player } = getState();

          const playlistObject = getPlaylistObjectSelector(nextTrack.playlistId)(getState());

          if (playlistObject) {
            const {
              items: [firstItem]
            } = playlistObject;

            nextTrack.id = firstItem.id;

            dispatch(
              setPlayingTrack(
                nextTrack,
                getCurrentPosition({ queue: player.queue, playingTrack: nextTrack }),
                changeType
              )
            );
          }
        }
      } else {
        const {
          items: [firstItem]
        } = trackPlaylistObject;

        if (
          playlistEntitity &&
          !trackPlaylistObject.isFetching &&
          !trackPlaylistObject.items.length &&
          playlistEntitity.track_count !== 0
        ) {
          throw new Error('This playlist is empty or not available via a third party!');
        } else if (trackPlaylistObject.items.length) {
          // If queue doesn't contain playlist yet

          if (forceSetPlaylist) {
            nextTrack.id = firstItem.id;
          }

          position = getCurrentPosition({ queue, playingTrack: nextTrack });

          dispatch(setPlayingTrack(nextTrack, position, changeType));
        }
      }
    }
  };
}

export function toggleStatus(newToggleStatus?: PlayerStatus): ThunkResult<any> {
  return (dispatch, getState) => {
    const state = getState();
    const {
      player: { status, currentPlaylistId }
    } = state;

    let newStatus = newToggleStatus;

    const streamPlaylist = getPlaylistObjectSelector(PlaylistTypes.STREAM)(state);

    if (streamPlaylist && currentPlaylistId === null && newStatus === PlayerStatus.PLAYING) {
      const first = streamPlaylist.items[0];

      let next: Partial<PlayingTrack> = { id: first.id };

      if (first.schema === 'playlists') {
        next = { playlistId: first.id.toString() };
      }

      dispatch(playTrack(PlaylistTypes.STREAM, next as PlayingTrack, true));
    }

    if (!newStatus) {
      newStatus = PlayerStatus.PLAYING === status ? PlayerStatus.PAUSED : PlayerStatus.PLAYING;
    }

    dispatch({
      type: PlayerActionTypes.TOGGLE_PLAYING,
      payload: {
        status: newStatus
      }
    });
  };
}

export function changeTrack(changeType: ChangeTypes, finished?: boolean): ThunkResult<void> {
  return (dispatch, getState) => {
    const {
      player,
      config: { repeat }
    } = getState();

    const { currentPlaylistId, queue, currentIndex, currentTime } = player;

    if (!currentPlaylistId) {
      return;
    }

    const currentPlaylistObject = getPlaylistObjectSelector(currentPlaylistId)(getState());

    let nextIndex = currentIndex;

    switch (changeType) {
      case ChangeTypes.NEXT:
        nextIndex = currentIndex + 1;
        break;
      case ChangeTypes.PREV:
        if (currentTime < 5) {
          nextIndex = currentIndex - 1;
        }
        break;
      default:
    }

    if (finished && repeat === RepeatTypes.ONE) {
      nextIndex = currentIndex;
    }

    // If last song
    if ((nextIndex === queue.length && currentPlaylistObject && !currentPlaylistObject.nextUrl) || nextIndex === -1) {
      if (repeat === null) {
        dispatch(toggleStatus(PlayerStatus.PAUSED));

        return;
      }

      if (repeat === RepeatTypes.ALL) {
        nextIndex = 0;
      }
    }

    if (nextIndex > queue.length - 1) {
      return;
    }

    if (nextIndex < 0) {
      nextIndex = 0;
    }

    const nextTrack = queue[nextIndex];

    if (nextTrack) {
      dispatch(playTrack(currentPlaylistId, nextTrack, false, changeType));
    }
  };
}
/**
 * Add up next feature
 */
export function addUpNext(
  track: SoundCloud.Track | SoundCloud.Playlist | Normalized.Playlist | Normalized.Track,
  remove?: number
): ThunkResult<void> {
  return (dispatch, getState) => {
    const {
      player: { queue, currentPlaylistId, playingTrack }
    } = getState();

    const isPlaylist = track.kind === 'playlist';

    const nextTrack = {
      id: track.id,
      playlistId: currentPlaylistId,
      un: Date.now()
    };

    let nextList: PlayingTrack[] = [];

    if (isPlaylist) {
      const playlist = track as SoundCloud.Playlist;
      const { tracks = [] } = playlist;

      nextList = tracks
        .map((t): PlayingTrack | null => {
          if (!SC.isStreamable(t)) {
            return null;
          }

          return {
            id: t.id,
            playlistId: track.id.toString(),
            un: Date.now()
          };
        })
        .filter(t => t) as PlayingTrack[];
    }

    if (queue.length) {
      if (remove === undefined) {
        dispatch(
          addToast({
            message: `Added ${isPlaylist ? 'playlist' : 'track'} to play queue`,
            intent: Intent.SUCCESS
          })
        );
      }
      dispatch({
        type: PlayerActionTypes.ADD_UP_NEXT,
        payload: {
          next: isPlaylist ? nextList : [nextTrack],
          remove,
          position: getCurrentPosition({ queue, playingTrack }),
          playlist: isPlaylist
        }
      });
    }
  };
}
