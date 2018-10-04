import { ipcRenderer } from 'electron';
import flattenDeep from 'lodash/flattenDeep';
import { action } from 'typesafe-actions';
import { SoundCloud, ThunkResult } from '../../../types';
import { EVENTS } from '../../constants/events';
import { PLAYLISTS } from '../../constants/playlist';
import { getCurrentPosition } from '../../utils/playerUtils';
import { ObjectTypes } from '../objects';
import { fetchMore, fetchPlaylistIfNeeded, fetchPlaylistTracks, fetchTracks } from '../objects/actions';
import { ChangeTypes, PlayerActionTypes, PlayerStatus, PlayingPositionState, PlayingTrack, RepeatTypes } from './types';
import { addToast } from '../ui';
import { Intent } from '@blueprintjs/core';

/**
 * Get playlist from ID if needed
 *
 * @param playlistId
 * @param position
 * @returns {function(*, *)}
 */
export function getPlaylistObject(playlistId: string, position: number): ThunkResult<any> {
    return (dispatch, getState) => {

        const {
            objects,
            player: {
                containsPlaylists
            }
        } = getState();

        let playlists = objects[ObjectTypes.PLAYLISTS] || {};
        const track_playlist_obj = playlists[playlistId];

        if (!track_playlist_obj) {

            return dispatch<Promise<any>>(fetchPlaylistIfNeeded(+playlistId))
                .then((result: any) => {
                    const {
                        // eslint-disable-next-line
                        objects,
                        entities: {
                            playlistEntities
                        }
                    } = getState();

                    playlists = objects[ObjectTypes.PLAYLISTS] || {};
                    const current_playlist = playlists[playlistId];
                    const current_playlist_ent = playlistEntities[playlistId];

                    if (!current_playlist.isFetching && (current_playlist.items.length === 0 && current_playlist_ent.duration === 0 || current_playlist_ent.track_count === 0)) {
                        throw new Error('This playlist is empty or not available via a third party!');
                    }

                    // Try and fetch all playlist tracks
                    if (current_playlist.fetchedItems < current_playlist.items.length) {
                        dispatch(fetchPlaylistTracks(+playlistId, 50));
                    }

                    return result;
                });
        }

        const playlist = containsPlaylists.find((p) => position > p.start && position < p.end);

        if (playlist) {
            const playlist_obj = playlists[playlistId];
            if (playlist_obj) {
                /**
                 * If amount of fetched items - 25 is in the visible queue, fetch more tracks
                 */

                if (position > (playlist.start + playlist_obj.fetchedItems - 25) && !playlist_obj.isFetching) {
                    dispatch(fetchPlaylistTracks(playlist.id, 50));
                }
            }
        }


        return Promise.resolve();


    };
}

export const setCurrentTime = (time: number) => action(PlayerActionTypes.SET_TIME, { time });
export const updateTime = (time: number) => action(PlayerActionTypes.UPDATE_TIME, { time });
export const setDuration = (time: number) => action(PlayerActionTypes.SET_DURATION, { time });

export function toggleStatus(newStatus?: PlayerStatus): ThunkResult<void> {
    return (dispatch, getState) => {
        const {
            player: {
                status,
                currentPlaylistId
            },
            objects
        } = getState();

        const playlists = objects[ObjectTypes.PLAYLISTS] || {};
        const stream_playlist = playlists[PLAYLISTS.STREAM];

        if (currentPlaylistId === null && newStatus === PlayerStatus.PLAYING) {
            dispatch(playTrack(PLAYLISTS.STREAM, { id: stream_playlist.items[0].id }));
        }

        if (!newStatus) {
            if (PlayerStatus.PLAYING === status) {
                newStatus = PlayerStatus.PAUSED;
            } else {
                newStatus = PlayerStatus.PLAYING;
            }
        }

        // TODO RE-Add player error

        // if (!status !== PlayerStatus.ERROR) {
        dispatch({
            type: PlayerActionTypes.TOGGLE_PLAYING,
            payload: {
                status: newStatus
            }
        })
        // }

        ipcRenderer.send(EVENTS.PLAYER.STATUS_CHANGED);
    };
}

/**
 * Set new playlist as first or add a playlist if it doesn't exist yet
 *
 * @param playlistId
 * @param nextTrack
 */
export function setCurrentPlaylist(playlistId: string, nextTrack: PlayingTrack | null): ThunkResult<Promise<any>> {
    return (dispatch, getState) => {
        const {
            objects,
            entities,
            player: {
                currentPlaylistId
            }
        } = getState();

        const playlists = objects[ObjectTypes.PLAYLISTS] || {};
        const playlistObject = playlists[playlistId.toString()];
        const { playlistEntities, trackEntities } = entities;

        const containsPlaylists: Array<PlayingPositionState> = [];

        if ((playlistObject && playlistId !== currentPlaylistId) || nextTrack) {
            return dispatch<Promise<any>>({
                type: PlayerActionTypes.SET_PLAYLIST,
                payload: {
                    promise: Promise.resolve({
                        playlistId,
                        items: flattenDeep(playlistObject.items
                            .filter((trackIdSchema) => (trackIdSchema && trackIdSchema.schema !== 'users'))
                            .map((trackIdSchema, i: number) => {
                                const id = trackIdSchema.id;
                                const playlist = playlistEntities[id];

                                if (playlist) {
                                    containsPlaylists.push({
                                        id: playlist.id,
                                        start: i,
                                        end: i + playlist.tracks.length
                                    });

                                    return playlist.tracks.map((trackIdResult) => {

                                        const trackId = trackIdResult.id;

                                        if (trackEntities[trackId] && !trackEntities[trackId].streamable) {
                                            return null;
                                        }

                                        return {
                                            id: trackId,
                                            playlistId: id.toString(),
                                            // un: new Date().getTime()
                                        };
                                    }).filter((t) => t != null);
                                }

                                if (trackEntities[id] && !trackEntities[id].streamable) {
                                    return null;
                                }

                                return {
                                    id,
                                    playlistId,
                                    // un: new Date().getTime()
                                };
                            })).filter((t) => t != null),
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
 * Set currentrackIndex & start playing
 *
 * @param nextTrack
 * @param position
 */
export function setPlayingTrack(nextTrack: PlayingTrack, position: number, changeType?: ChangeTypes): ThunkResult<any> {
    return (dispatch, getState) => {

        const { entities: { trackEntities } } = getState();

        const track = trackEntities[nextTrack.id];

        if (track && !track.streamable) {
            if (changeType && (changeType in Object.values(ChangeTypes))) {
                return changeTrack(changeType);
            }
        }

        dispatch({
            type: PlayerActionTypes.SET_TRACK,
            payload: {
                nextTrack,
                status: PlayerStatus.PLAYING,
                position
            }
        });

        return ipcRenderer.send(EVENTS.PLAYER.TRACK_CHANGED);


    };

}

/**
 * Add up next feature
 *
 * @param trackId
 * @param track_playlist
 * @param remove
 */
export function addUpNext(track: SoundCloud.Track | SoundCloud.Playlist, remove?: number): ThunkResult<void> {
    return (dispatch, getState) => {
        const {
            player: {
                queue,
                currentPlaylistId,
                playingTrack
            }
        } = getState();

        const isPlaylist = track.kind === 'playlist';

        const nextTrack = {
            id: track.id,
            playlistId: currentPlaylistId,
            // un: new Date().getTime()
        };

        let nextList;

        if (isPlaylist) {
            const playlist = track as SoundCloud.Playlist;

            nextList = playlist.tracks.map((t) => {

                if (!t.streamable) {
                    return null;
                }

                return {
                    id: t.id,
                    playlistId: track.id,
                    // un: new Date().getTime()
                };
            }).filter((t) => t != null);
        }

        if (queue.length) {
            if (!remove) {

                dispatch(addToast({
                    message: `track to play queue`,
                    intent: Intent.SUCCESS
                }))
                
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

/**
 * Update queue when scrolling through
 *
 * @param range
 * @returns {function(*, *)}
 */
export function updateQueue(range: Array<number>): ThunkResult<void> {
    return (dispatch, getState) => {

        const {
            player,
        } = getState();
        const {
            queue,
            currentPlaylistId
        } = player;

        if (currentPlaylistId) {
            if (queue.length < range[1] + 5) {
                dispatch(fetchMore(currentPlaylistId, ObjectTypes.PLAYLISTS));
            }

            dispatch(getItemsAround(range[1]));
        }
    };
}

export function getItemsAround(position: number): ThunkResult<void> {
    return (dispatch, getState) => {
        const {
            player: {
                queue,
                currentPlaylistId
            },
            entities: {
                trackEntities,
                playlistEntities
            },
            objects
        } = getState();

        if (currentPlaylistId) {
            const playlists = objects[ObjectTypes.PLAYLISTS] || {};
            const currentPlaylist = playlists[currentPlaylistId];

            const itemsToFetch: number[] = [];

            const lowBound = position - 3;
            const highBound = position + 3;

            // Get playlists
            for (let i = (lowBound < 0 ? 0 : position); i < (highBound > queue.length ? queue.length : highBound); i += 1) {
                const queueItem = queue[i];

                if (queueItem && queueItem.id) {

                    const playlist = playlistEntities[queueItem.playlistId];

                    if (playlist) {
                        dispatch(getPlaylistObject(queueItem.playlistId, i));
                    }

                    if (!trackEntities[queueItem.id]) {
                        itemsToFetch.push(queueItem.id);
                    }

                    if (currentPlaylist && currentPlaylist.fetchedItems && currentPlaylist.fetchedItems - 10 < i && currentPlaylist.fetchedItems !== currentPlaylist.items.length) {
                        dispatch(fetchPlaylistTracks(+currentPlaylistId, 30));
                    }
                }
            }

            if (itemsToFetch.length) {
                dispatch(fetchTracks(itemsToFetch));
            }
        }
    };
}

export function playTrackFromIndex(playlistId: string, trackIndex: number, forceSetPlaylist = false): ThunkResult<void> {
    return (dispatch, getState) => {
        const { player: { queue } } = getState();

        const track = queue[trackIndex];

        if (track) {
            dispatch(playTrack(playlistId, track, forceSetPlaylist));
        }

    };
}

/**
 * Function for playing a new track or playlist
 *
 * Before playing the current track, check if the track passed to the function is a playlist. If so, save the parent
 * playlist and execute the function with the child playlist. If the new playlist doesn't exist, fetch it before moving on.
 *
 * @param playlistId
 * @param trackId
 * @param trackPlaylist
 * @param force_set_playlist
 * @returns {function(*, *)}
 */
export function playTrack(playlistId: string, next: { id: number; playlistId?: string; }, force_set_playlist = false, changeType?: ChangeTypes): ThunkResult<any> {
    return (dispatch, getState) => {

        const {
            player: {
                currentPlaylistId
            }
        } = getState();

        if (!next.playlistId) {
            next.playlistId = playlistId;
        }

        const nextTrack: PlayingTrack = next as PlayingTrack;

        /**
         * If playlist isn't current, set current & add items to queue
         */

        let promise: Promise<any> = Promise.resolve();

        if (currentPlaylistId !== playlistId || force_set_playlist) {
            promise = dispatch<Promise<any>>(setCurrentPlaylist(playlistId, force_set_playlist && nextTrack ? nextTrack : null));
        }

        promise.then(() => {
            const {
                objects,
                entities: {
                    playlistEntities
                },
                player: {
                    queue,
                    playingTrack
                }
            } = getState();

            const playlistObjects = objects[ObjectTypes.PLAYLISTS] || {};
            let position = getCurrentPosition({ queue, playingTrack });

            position = (typeof force_set_playlist === 'number' ? force_set_playlist : undefined) || getCurrentPosition({ queue, playingTrack: nextTrack });

            if (position !== -1) {
                dispatch(getItemsAround(position));
            }

            if (nextTrack.id) {
                const trackPlaylistObject = playlistObjects[playlistId];

                if (trackPlaylistObject && position + 10 >= queue.length && trackPlaylistObject.nextUrl) {
                    dispatch<Promise<any>>(fetchMore(playlistId, ObjectTypes.PLAYLISTS))
                        .then(() => {
                            dispatch(setPlayingTrack(nextTrack, position, changeType));
                        });
                } else {

                    dispatch(setPlayingTrack(nextTrack, position, changeType));
                }


            } else if (!nextTrack.id) {

                const trackPlaylistObject = playlistObjects[nextTrack.playlistId];
                const trackPlaylistEntitity = playlistEntities[nextTrack.playlistId];

                if (!trackPlaylistObject) {

                    if (trackPlaylistEntitity.track_count > 0) {

                        dispatch<Promise<any>>(getPlaylistObject(nextTrack.playlistId, 0))
                            .then(() => {
                                const {
                                    objects,
                                    player: {
                                        queue
                                    }
                                } = getState();

                                const playlists = objects[ObjectTypes.PLAYLISTS] || {};
                                const { items: [firstItem] } = playlists[nextTrack.playlistId];

                                nextTrack.id = firstItem.id;

                                const position = getCurrentPosition({ queue, playingTrack: nextTrack });

                                dispatch(setPlayingTrack(nextTrack, position, changeType));

                            });
                    }

                } else {

                    const { items: [firstItem] } = trackPlaylistObject;

                    if (!trackPlaylistObject.isFetching && !trackPlaylistObject.items.length && trackPlaylistEntitity.track_count !== 0) {
                        throw new Error('This playlist is empty or not available via a third party!');
                    } else {
                        // If queue doesn't contain playlist yet

                        if (force_set_playlist) {
                            nextTrack.id = firstItem.id;
                            position = getCurrentPosition({ queue, playingTrack: nextTrack });
                        } else {
                            position = getCurrentPosition({ queue, playingTrack: nextTrack });
                        }

                        dispatch(setPlayingTrack(nextTrack, position, changeType));

                    }
                }

            }

            ipcRenderer.send(EVENTS.PLAYER.STATUS_CHANGED);
        });

    };
}

export function changeTrack(changeType: ChangeTypes): ThunkResult<void> {
    return (dispatch, getState) => {
        const {
            player,
            objects,
            config: {
                repeat
            }
        } = getState();


        const {
            currentPlaylistId,
            queue,
            currentIndex,
        } = player;

        if (!currentPlaylistId) return;

        const playlists = objects[ObjectTypes.PLAYLISTS] || {};
        const currentPlaylistObject = playlists[currentPlaylistId];

        let nextIndex = currentIndex;

        switch (changeType) {
            case ChangeTypes.NEXT:
                nextIndex = currentIndex + 1;
                break;
            case ChangeTypes.PREV:
                nextIndex = currentIndex - 1;
                break;
            default:
                break;
        }

        if (repeat === RepeatTypes.ONE) {
            nextIndex = currentIndex;
        }

        // If last song
        if (((nextIndex === queue.length && !currentPlaylistObject.nextUrl) || nextIndex === -1)) {
            if (repeat === null) {
                dispatch(toggleStatus(PlayerStatus.PAUSED));
                dispatch(updateTime(0));

                return;
            }

            if (repeat === RepeatTypes.ALL) {
                nextIndex = 0;
            }
        }

        if (nextIndex > (queue.length - 1)) return;

        if (nextIndex < 0) {
            nextIndex = 0;
        }

        const nextTrack = queue[nextIndex];

        if (!nextTrack) return;

        dispatch(playTrack(currentPlaylistId, nextTrack, false, changeType));
    };
}
