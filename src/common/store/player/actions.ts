import { wError, wSuccess } from '@common/utils/reduxUtils';
import { Normalized } from '@types';
import { createAction, createAsyncAction } from 'typesafe-actions';
import { ObjectStateItem } from '../objects';
import { PlaylistIdentifier } from '../playlist';
import { ChangeTypes, PlayerActionTypes, PlayerStatus } from '../types';

export const seekTo = createAction(PlayerActionTypes.SEEK_TO)<number>();
export const toggleShuffle = createAction(PlayerActionTypes.TOGGLE_SHUFFLE)<boolean>();
export const toggleStatus = createAction(PlayerActionTypes.TOGGLE_STATUS, (status?: PlayerStatus) => status)();
export const playlistFinished = createAction(PlayerActionTypes.PLAYLIST_FINISHED)();
export const restartTrack = createAction(PlayerActionTypes.RESTART_TRACK)();
export const trackFinished = createAction(PlayerActionTypes.TRACK_FINISHED)();
export const startPlayMusicIndex = createAction(PlayerActionTypes.START_PLAY_MUSIC_INDEX)<{
  index: number;
  changeType?: ChangeTypes;
}>();

export const changeTrack = createAction(PlayerActionTypes.CHANGE_TRACK, (changeType: ChangeTypes) => ({
  changeType
}))();

export const setCurrentTime = createAction(PlayerActionTypes.SET_TIME)<number>();

export const startPlayMusic = createAction(PlayerActionTypes.START_PLAY_MUSIC)<{
  idResult?: ObjectStateItem;
  origin?: PlaylistIdentifier;
  changeType?: ChangeTypes;
  nextPosition?: number;
}>();

export const playTrackFromQueue = createAction(PlayerActionTypes.PLAY_TRACK_FROM_QUEUE)<{
  idResult: ObjectStateItem;
  index: number;
}>();

interface PlayTrackProps {
  idResult: ObjectStateItem;
  origin: PlaylistIdentifier;
  nextPosition?: number;
}

export const playTrack = createAsyncAction(
  String(PlayerActionTypes.PLAY_TRACK),
  wSuccess(PlayerActionTypes.PLAY_TRACK),
  wError(PlayerActionTypes.PLAY_TRACK)
)<
  PlayTrackProps,
  PlayTrackProps & {
    duration: number;
    position: number;
    positionInPlaylist?: number;
    parentPlaylistID?: PlaylistIdentifier;
  },
  object
>();

interface PlayPlaylistProps {
  idResult: ObjectStateItem;
  origin: PlaylistIdentifier;
  changeType?: ChangeTypes;
  nextPosition?: number;
}

export const playPlaylist = createAction(PlayerActionTypes.PLAY_PLAYLIST)<PlayPlaylistProps>();

export const setCurrentPlaylist = createAsyncAction(
  String(PlayerActionTypes.SET_CURRENT_PLAYLIST),
  wSuccess(PlayerActionTypes.SET_CURRENT_PLAYLIST),
  wError(PlayerActionTypes.SET_CURRENT_PLAYLIST)
)<{ playlistId: PlaylistIdentifier }, { playlistId: PlaylistIdentifier; items: ObjectStateItem[] }, object>();
export const setCurrentIndex = createAction(PlayerActionTypes.SET_CURRENT_INDEX)<{
  position: number;
}>();
export const resolvePlaylistItems = createAction(PlayerActionTypes.RESOLVE_PLAYLIST_ITEMS)<{
  items: ObjectStateItem[];
  playlistItem: ObjectStateItem;
}>();
export const addUpNext = createAsyncAction(
  String(PlayerActionTypes.ADD_UP_NEXT),
  wSuccess(PlayerActionTypes.ADD_UP_NEXT),
  wError(PlayerActionTypes.ADD_UP_NEXT)
)<Normalized.NormalizedResult, { items: ObjectStateItem[] }, object>();

export const queueInsert = createAction(PlayerActionTypes.QUEUE_INSERT)<{
  items: ObjectStateItem[];
  position: number;
}>();
export const shuffleQueue = createAction(PlayerActionTypes.SHUFFLE_QUEUE)<{
  fromIndex: number;
}>();
export const setQueue = createAction(PlayerActionTypes.SET_QUEUE)<{
  items: Normalized.NormalizedResult[];
}>();
export const clearUpNext = createAction(PlayerActionTypes.CLEAR_UP_NEXT)();
export const removeFromQueue = createAction(PlayerActionTypes.REMOVE_FROM_QUEUE)<number>();
export const removeFromUpNext = createAction(PlayerActionTypes.REMOVE_FROM_UP_NEXT)<number>();
export const removeFromQueueOrUpNext = createAction(PlayerActionTypes.REMOVE_FROM_QUEUE_OR_UP_NEXT)<number>();

// OLD

// export function registerPlayO(): ThunkResult<void> {
//   return async (_dispatch, getState) => {
//     // const {
//     //   player: { playingTrack }
//     // } = getState();
//     // if (playingTrack) {
//     //   const { id, playlistId } = playingTrack;
//     //   const params: any = {
//     //     track_urn: `soundcloud:tracks:${id}`
//     //   };
//     //   await import('@common/utils/universalAnalytics').then(({ ua }) => {
//     //     ua.event('SoundCloud', 'Play', '', id).send();
//     //   });
//     //   const type = getPlaylistType(playlistId);
//     //   if ((!type || !(type in PlaylistTypes)) && typeof playlistId !== 'string') {
//     //     params.context_urn = `soundcloud:playlists:${playlistId}`;
//     //   }
//     //   await axiosClient.request({
//     //     url: SC.registerPlayUrl(),
//     //     method: 'POST',
//     //     data: params
//     //   });
//     // }
//   };
// }

// export function getItemsAroundO(position: number): ThunkResult<Promise<void>> {
//   return async (dispatch, getState) => {
//     // const {
//     //   player: { queue, currentPlaylistId }
//     // } = getState();
//     // if (currentPlaylistId) {
//     //   const currentPlaylist = getPlaylistObjectSelector({
//     //     objectId: currentPlaylistId,
//     //     playlistType: PlaylistTypes.MYTRACKS
//     //   })(getState());
//     //   const itemsToFetch: { position: number; id: number }[] = [];
//     //   const lowBound = position - 3;
//     //   const highBound = position + 3;
//     //   // Get playlists
//     //   for (let i = lowBound < 0 ? 0 : position; i < (highBound > queue.length ? queue.length : highBound); i += 1) {
//     //     const queueItem = queue[i];
//     //     if (queueItem && queueItem.id) {
//     //       const playlist = getPlaylistEntity(+queueItem.playlistId)(getState());
//     //       if (playlist) {
//     //         dispatch(getPlaylistObjectO(queueItem.playlistId, i));
//     //       }
//     //       const track = getTrackEntity(queueItem.id)(getState());
//     //       if (!track || (track && !track.title && !track.loading)) {
//     //         itemsToFetch.push({
//     //           position: i,
//     //           id: queueItem.id
//     //         });
//     //       }
//     //       if (
//     //         currentPlaylist &&
//     //         currentPlaylist.fetchedItems &&
//     //         currentPlaylist.fetchedItems - 10 < i &&
//     //         currentPlaylist.fetchedItems !== currentPlaylist.items.length
//     //       ) {
//     //         dispatch(fetchPlaylistTracks(+currentPlaylistId, 30));
//     //       }
//     //     }
//     //   }
//     //   if (itemsToFetch.length) {
//     //     const response = await dispatch<Promise<{ value: { entities: EntitiesState } }>>(
//     //       fetchTracks(itemsToFetch.map(i => i.id)) as any
//     //     );
//     //     const {
//     //       value: {
//     //         entities: { trackEntities = {} }
//     //       }
//     //     } = response;
//     //     // SoundCloud sometimes returns 404 for some tracks, if this happens, we clear it in our app
//     //     itemsToFetch.forEach(i => {
//     //       if (!trackEntities[i.id]) {
//     //         const queueItem = queue[i.position];
//     //         dispatch({
//     //           type: ObjectsActionTypes.UNSET_TRACK,
//     //           payload: {
//     //             trackId: i.id,
//     //             position: i.position,
//     //             objectId: queueItem.playlistId,
//     //             entities: {
//     //               trackEntities: {
//     //                 [i.id]: undefined
//     //               }
//     //             }
//     //           }
//     //         });
//     //       }
//     //     });
//     //   }
//     // }
//   };
// }

// /**
//  * Update queue when scrolling through
//  */
// export function updateQueueO(range: number[]): ThunkResult<void> {
//   return (dispatch, getState) => {
//     // const { player } = getState();
//     // const { queue, currentPlaylistId } = player;
//     // if (currentPlaylistId) {
//     //   if (queue.length < range[1] + 5) {
//     //     dispatch(fetchMore(currentPlaylistId, ObjectTypes.PLAYLISTS));
//     //   }
//     //   dispatch(getItemsAroundO(range[1]));
//     // }
//   };
// }

// export function processQueueItemsO(result: Normalized.NormalizedResult[], keepFirst = false, newPlaylistId?: string) {
//   // return async (dispatch, getState) => {
//   //   const {
//   //     player: { currentPlaylistId },
//   //     config: { shuffle }
//   //   } = getState();
//   //   if (!currentPlaylistId && !newPlaylistId) {
//   //     return [[], []];
//   //   }
//   //   const currentPlaylist = newPlaylistId || (currentPlaylistId as string);
//   //   const items = await Promise.all(
//   //     result
//   //       .filter(trackIdSchema => trackIdSchema && trackIdSchema.schema !== 'users')
//   //       .map(
//   //         async (trackIdSchema): Promise<PlayingTrack | null | (PlayingTrack | null)[]> => {
//   //           const { id } = trackIdSchema;
//   //           const playlist = getPlaylistEntity(id)(getState());
//   //           const playlistObject = getPlaylistObjectSelector({
//   //             objectId: id.toString(),
//   //             playlistType: PlaylistTypes.MYTRACKS
//   //           })(getState());
//   //           if (playlist) {
//   //             if (!playlistObject) {
//   //               dispatch(fetchPlaylistIfNeeded(id));
//   //             } else {
//   //               return playlistObject.items.map((trackIdResult): PlayingTrack | null => {
//   //                 const trackId = trackIdResult.id;
//   //                 const track = getTrackEntity(id)(getState());
//   //                 if (track && !SC.isStreamable(track)) {
//   //                   return null;
//   //                 }
//   //                 return {
//   //                   id: trackId,
//   //                   playlistId: id.toString(),
//   //                   un: Date.now()
//   //                 };
//   //               });
//   //             }
//   //             return null;
//   //           }
//   //           const track = getTrackEntity(id)(getState());
//   //           if (track && !SC.isStreamable(track)) {
//   //             return null;
//   //           }
//   //           return {
//   //             id,
//   //             playlistId: currentPlaylist.toString(),
//   //             un: Date.now()
//   //           };
//   //         }
//   //       )
//   //   );
//   //   const flattened = _.flatten(items).filter((t): t is PlayingTrack => !!t);
//   //   if (keepFirst) {
//   //     const [firstItem, ...rest] = flattened;
//   //     const processedRest = shuffle ? _.shuffle(rest) : rest;
//   //     return [[firstItem, ...processedRest], flattened];
//   //   }
//   //   const processedItems = shuffle ? _.shuffle(flattened) : flattened;
//   //   return [processedItems, flattened];
//   // };
// }

// /**
//  * Set new playlist as first or add a playlist if it doesn't exist yet
//  */
// export function setCurrentPlaylistO(playlistId: string, nextTrack: PlayingTrack | null): ThunkResult<Promise<any>> {
//   return async (dispatch, getState) => {
//     // const state = getState();

//     // const {
//     //   player: { currentPlaylistId }
//     // } = state;

//     // const playlistObject = getPlaylistObjectSelector({ objectId: playlistId, playlistType: PlaylistTypes.MYTRACKS })(
//     //   state
//     // );

//     // const containsPlaylists: PlayingPositionState[] = [];

//     // if (playlistObject && (nextTrack || playlistId !== currentPlaylistId)) {
//     //   const [items, originalItems] = await dispatch<Promise<ProcessedQueueItems>>(
//     //     processQueueItemsO(playlistObject.items, true, playlistId)
//     //   );

//     //   if (nextTrack && !nextTrack.id) {
//     //     await dispatch<Promise<any>>(fetchPlaylistIfNeeded(+nextTrack.playlistId));
//     //   }

//     //   return dispatch<Promise<any>>({
//     //     type: PlayerActionTypes.SET_PLAYLIST,
//     //     payload: {
//     //       promise: Promise.resolve({
//     //         playlistId,
//     //         items,
//     //         originalItems,
//     //         nextTrack,
//     //         containsPlaylists
//     //       })
//     //     }
//     //   } as any);
//     // }

//     return Promise.resolve();
//   };
// }

// /**
//  * Function for playing a new track or playlist
//  *
//  * Before playing the current track, check if the track passed to the function is a playlist. If so, save the parent
//  * playlist and execute the function with the child playlist. If the new playlist doesn't exist, fetch it before moving on.
//  */

// interface Next {
//   id: number;
//   playlistId?: string;
// }

// export function playTrackO(
//   playlistId: string,
//   next?: Next,
//   forceSetPlaylist = false,
//   changeType?: ChangeTypes
// ): ThunkResult<any> {
//   // tslint:disable-next-line: max-func-body-length cyclomatic-complexity
//   return async (dispatch, getState) => {
//     // const {
//     //   player: { currentPlaylistId }
//     // } = getState();
//     // let nextTrack: PlayingTrack = next as PlayingTrack;
//     // if (!next) {
//     //   const object = getPlaylistObjectSelector({ objectId: playlistId, playlistType: PlaylistTypes.MYTRACKS })(
//     //     getState()
//     //   );
//     //   if (object) {
//     //     // tslint:disable-next-line: no-parameter-reassignment
//     //     nextTrack = {
//     //       playlistId: playlistId.toString(),
//     //       id: object.items[0].id,
//     //       un: Date.now()
//     //     };
//     //   }
//     // } else if (!next.playlistId) {
//     //   nextTrack.playlistId = playlistId.toString();
//     // }
//     // /**
//     //  * If playlist isn't current, set current & add items to queue
//     //  */
//     // if (currentPlaylistId !== playlistId || forceSetPlaylist) {
//     //   await dispatch<Promise<any>>(setCurrentPlaylistO(playlistId, forceSetPlaylist && nextTrack ? nextTrack : null));
//     // }
//     // const state = getState();
//     // const {
//     //   player: { queue }
//     // } = state;
//     // let position = getCurrentPosition({ queue, playingTrack: nextTrack });
//     // if (position !== -1) {
//     //   dispatch(getItemsAroundO(position));
//     // }
//     // // We know the id, just set the track
//     // if (nextTrack.id) {
//     //   const trackPlaylistObject = getPlaylistObjectSelector({
//     //     objectId: playlistId,
//     //     playlistType: PlaylistTypes.MYTRACKS
//     //   })(state);
//     //   if (trackPlaylistObject && position + 10 >= queue.length && trackPlaylistObject.nextUrl) {
//     //     await dispatch<Promise<any>>(fetchMore(playlistId, ObjectTypes.PLAYLISTS));
//     //   }
//     //   dispatch(setPlayingTrackO(nextTrack, position, changeType));
//     //   // No id is given, this means we want to play a playlist
//     // } else if (!nextTrack.id) {
//     //   const trackPlaylistObject = getPlaylistObjectSelector({
//     //     objectId: nextTrack.playlistId,
//     //     playlistType: PlaylistTypes.MYTRACKS
//     //   })(state);
//     //   const playlistEntitity = getPlaylistEntity(+nextTrack.playlistId)(state);
//     //   if (!trackPlaylistObject) {
//     //     if (playlistEntitity && playlistEntitity.track_count > 0) {
//     //       await dispatch<Promise<any>>(getPlaylistObjectO(nextTrack.playlistId, 0));
//     //       const { player } = getState();
//     //       const playlistObject = getPlaylistObjectSelector({
//     //         objectId: nextTrack.playlistId,
//     //         playlistType: PlaylistTypes.MYTRACKS
//     //       })(getState());
//     //       if (playlistObject) {
//     //         const {
//     //           items: [firstItem]
//     //         } = playlistObject;
//     //         nextTrack.id = firstItem.id;
//     //         dispatch(
//     //           setPlayingTrackO(
//     //             nextTrack,
//     //             getCurrentPosition({ queue: player.queue, playingTrack: nextTrack }),
//     //             changeType
//     //           )
//     //         );
//     //       }
//     //     }
//     //   } else {
//     //     const {
//     //       items: [firstItem]
//     //     } = trackPlaylistObject;
//     //     if (
//     //       playlistEntitity &&
//     //       !trackPlaylistObject.isFetching &&
//     //       !trackPlaylistObject.items.length &&
//     //       playlistEntitity.track_count !== 0
//     //     ) {
//     //       throw new Error('This playlist is empty or not available via a third party!');
//     //     } else if (trackPlaylistObject.items.length) {
//     //       // If queue doesn't contain playlist yet
//     //       if (forceSetPlaylist) {
//     //         nextTrack.id = firstItem.id;
//     //       }
//     //       position = getCurrentPosition({ queue, playingTrack: nextTrack });
//     //       dispatch(setPlayingTrackO(nextTrack, position, changeType));
//     //     }
//     //   }
//     // }
//   };
// }

// /**
//  * Add up next feature
//  */
// export function addUpNextO(
//   track: SoundCloud.Track | SoundCloud.Playlist | Normalized.Playlist | Normalized.Track,
//   remove?: number
// ): ThunkResult<void> {
//   return (dispatch, getState) => {
//     // const {
//     //   player: { queue, currentPlaylistId, playingTrack }
//     // } = getState();
//     // const isPlaylist = track.kind === 'playlist';
//     // const nextTrack = {
//     //   id: track.id,
//     //   playlistId: currentPlaylistId,
//     //   un: Date.now()
//     // };
//     // let nextList: PlayingTrack[] = [];
//     // if (isPlaylist) {
//     //   const playlist = track as SoundCloud.Playlist;
//     //   const { tracks = [] } = playlist;
//     //   nextList = tracks
//     //     .map((t): PlayingTrack | null => {
//     //       if (!SC.isStreamable(t)) {
//     //         return null;
//     //       }
//     //       return {
//     //         id: t.id,
//     //         playlistId: track.id.toString(),
//     //         un: Date.now()
//     //       };
//     //     })
//     //     .filter(t => t) as PlayingTrack[];
//     // }
//     // if (queue.length) {
//     //   if (remove === undefined) {
//     //     dispatch(
//     //       addToast({
//     //         message: `Added ${isPlaylist ? 'playlist' : 'track'} to play queue`,
//     //         intent: Intent.SUCCESS
//     //       })
//     //     );
//     //   }
//     //   dispatch({
//     //     type: PlayerActionTypes.ADD_UP_NEXT,
//     //     payload: {
//     //       next: isPlaylist ? nextList : [nextTrack],
//     //       remove,
//     //       position: getCurrentPosition({ queue, playingTrack }),
//     //       playlist: isPlaylist
//     //     }
//     //   });
//     // }
//   };
// }
