import flattenDeep from 'lodash/flattenDeep';
import React from 'react';
import { toastr } from 'react-redux-toastr';
import ReactImageFallback from '../../../renderer/modules/_shared/FallbackImage';
import { actionTypes, IMAGE_SIZES, OBJECT_TYPES, PLAYER_STATUS, CHANGE_TYPES } from '../../constants';
import { EVENTS } from '../../constants/events';
import { PLAYLISTS } from '../../constants/playlist';
import { SC } from '../../utils';
import { getCurrentPosition } from '../../utils/playerUtils';
import { windowRouter } from '../../utils/router';
import { fetchPlaylistIfNeeded } from '../index';
import { fetchMore } from '../objectActions';
import { fetchPlaylistTracks, fetchTracks } from '../playlist.actions';
import { playTrack } from './playTrack.actions';
import { changeTrack } from './changeTrack.actions';


const obj_type = OBJECT_TYPES.PLAYLISTS

export * from './changeTrack.actions';
export * from './playTrack.actions';

/**
 * Get playlist from ID if needed
 *
 * @param playlistId
 * @param position
 * @returns {function(*, *)}
 */
export function getPlaylistObject(playlistId, position) {
    return (dispatch, getState) => {

        const {
            objects,
            player: {
                playlist_pos
            }
        } = getState()

        let playlists = objects[obj_type] || {}
        const track_playlist_obj = playlists[playlistId]


        if (!track_playlist_obj) {

            return dispatch(fetchPlaylistIfNeeded(playlistId))
                .then((result) => {
                    const {
                        // eslint-disable-next-line
                        objects,
                        entities: {
                            playlist_entities
                        }
                    } = getState()

                    playlists = objects[obj_type] || {}
                    const current_playlist = playlists[playlistId]
                    const current_playlist_ent = playlist_entities[playlistId]

                    if (!current_playlist.isFetching && (current_playlist.items.length === 0 && current_playlist_ent.duration === 0 || current_playlist_ent.track_count === 0)) {
                        throw new Error('This playlist is empty or not available via a third party!')
                    }

                    // Try and fetch all playlist tracks
                    if (current_playlist.fetchedItems < current_playlist.items.length) {
                        dispatch(fetchPlaylistTracks(playlistId, 50))
                    }

                    return result
                })


        }

        const playlist = playlist_pos.find(p => position > p.start && position < p.end)

        if (playlist) {
            const playlist_obj = playlists[playlistId]
            if (playlist_obj) {
                /**
                 * If amount of fetched items - 25 is in the visible queue, fetch more tracks
                 */

                if (position > (playlist.start + playlist_obj.fetchedItems - 25) && !playlist_obj.isFetching) {
                    dispatch(fetchPlaylistTracks(playlist.id, 50))
                }
            }
        }


        return Promise.resolve()


    }
}

/**
 * Set current time for the song
 *
 * @param time
 * @returns {{type, time: *}}
 */
export function setCurrentTime(time) {
    return {
        type: actionTypes.PLAYER_SET_TIME,
        payload: {
            time
        }
    }
}

/**
 * Update time for the audio player
 *
 * @param time
 * @returns {{type, time: *}}
 */
export function updateTime(time) {
    return {
        type: actionTypes.PLAYER_UPDATE_TIME,
        payload: {
            time
        }
    }
}

/**
 * Set duration for current song
 *
 * @param time
 * @returns {{type, time: *}}
 */
export function setDuration(time) {
    return {
        type: actionTypes.PLAYER_SET_DURATION,
        payload: {
            time
        }
    }
}


/**
 * Toggle music status
 *
 * @param new_status
 * @returns {{type, playing: *}}
 */
export function toggleStatus(statusParam) {
    return (dispatch, getState) => {
        const {
            player: {
                status,
                currentPlaylistId
            },
            objects
        } = getState()

        let new_status = statusParam;

        const playlists = objects[OBJECT_TYPES.PLAYLISTS] || {}
        const stream_playlist = playlists[PLAYLISTS.STREAM]


        if (currentPlaylistId === null && new_status === PLAYER_STATUS.PLAYING) {
            dispatch(playTrack(PLAYLISTS.STREAM, stream_playlist.items[0]))
        }

        if (!new_status) {
            if (PLAYER_STATUS.PLAYING === status) {
                new_status = PLAYER_STATUS.PAUSED
            } else {
                new_status = PLAYER_STATUS.PLAYING
            }
        }

        if (!status !== PLAYER_STATUS.ERROR) {
            dispatch({
                type: actionTypes.PLAYER_TOGGLE_PLAYING,
                payload: {
                    status: new_status
                }
            })
        }

        windowRouter.send(EVENTS.PLAYER.STATUS_CHANGED)
    }
}

/**
 * Set new playlist as first or add a playlist if it doesn't exist yet
 *
 * @param playlistId
 * @param next_track
 */
export function setCurrentPlaylist(playlistId, next_track) {

    return (dispatch, getState) => {
        const {
            objects,
            entities,
            player: {
                currentPlaylistId
            }
        } = getState()

        const playlists = objects[obj_type] || {}
        const playlist_object = playlists[playlistId]
        const { playlist_entities, track_entities } = entities

        const playlist_pos = []

        if ((playlist_object && playlistId !== currentPlaylistId) || next_track) {
            return dispatch({
                type: actionTypes.PLAYER_SET_PLAYLIST,
                payload: {
                    promise: Promise.resolve({
                        playlistId,
                        items: flattenDeep(playlist_object.items
                            .filter(trackIdSchema => trackIdSchema.schema !== 'users')
                            .map((trackIdSchema, i) => {
                                const id = trackIdSchema.id || trackIdSchema
                                const playlist = playlist_entities[id]

                                if (playlist) {
                                    playlist_pos.push({
                                        ...playlist,
                                        start: i,
                                        end: i + playlist.tracks.length
                                    })

                                    return playlist.tracks.map(trackId => {
                                        if (track_entities[trackId] && !track_entities[trackId].streamable) {
                                            console.log("not streamable", track_entities[id])
                                            return null;
                                        }

                                        return {
                                            id: trackId,
                                            playlistId: id,
                                            un: new Date().getTime()
                                        }
                                    }).filter(t => t != null)
                                }

                                if (track_entities[id] && !track_entities[id].streamable) {
                                    return null;
                                }

                                return {
                                    id,
                                    playlistId,
                                    un: new Date().getTime()
                                }
                            })).filter(t => t != null),
                        next_track,
                        playlist_pos
                    })

                }
            })

        }
        return Promise.resolve()



    }
}

/**
 * Set currentrackIndex & start playing
 *
 * @param nextTrack
 * @param position
 */
export function setPlayingTrack(nextTrack, position, changeType) {
    return (dispatch, getState) => {

        const { entities: { track_entities } } = getState();

        const track = track_entities[nextTrack.id]

        if (track && !track.streamable) {
            if (changeType && (changeType in Object.values(CHANGE_TYPES))) {
                return changeTrack(changeType)
            }
        }
        dispatch({
            type: actionTypes.PLAYER_SET_TRACK,
            payload: {
                nextTrack,
                status: PLAYER_STATUS.PLAYING,
                position
            }
        })

        windowRouter.send(EVENTS.PLAYER.TRACK_CHANGED, nextTrack.id)

    }

}

/**
 * Add up next feature
 *
 * @param trackId
 * @param track_playlist
 * @param remove
 */
export function addUpNext(track, remove = null) {
    return (dispatch, getState) => {
        const {
            player: {
                queue,
                currentPlaylistId,
                playingTrack

            }
        } = getState()

        const isPlaylist = track.kind === "playlist";

        const nextTrack = {
            id: track.id,
            playlistId: currentPlaylistId,
            un: new Date().getTime()
        }

        let nextList;

        if (isPlaylist) {
            nextList = track.tracks.map((t) => {

                if (!t.streamable) {
                    return null;
                }

                return {
                    id: t.id,
                    playlistId: track.id,
                    un: new Date().getTime()
                }
            }).filter(t => t != null)
        }

        if (queue.length) {
            if (!remove) {
                toastr.info(track.title, 'Added track to play queue', {
                    icon: (
                        <ReactImageFallback src={SC.getImageUrl(track, IMAGE_SIZES.MEDIUM)} />
                    ),
                    showCloseButton: false
                })

            }
            dispatch({
                type: actionTypes.PLAYER_ADD_UP_NEXT,
                payload: {
                    next: isPlaylist ? nextList : [nextTrack],
                    remove,
                    position: getCurrentPosition(queue, playingTrack),
                    playlist: isPlaylist
                }
            })
        }
    }
}

/**
 * Update queue when scrolling through
 *
 * @param range
 * @returns {function(*, *)}
 */
export function updateQueue(range) {
    return (dispatch, getState) => {

        const {
            player,
        } = getState()
        const {
            queue,
            currentPlaylistId
        } = player

        if (queue.length < range[1] + 5) {
            dispatch(fetchMore(currentPlaylistId, OBJECT_TYPES.PLAYLISTS))
        }

        dispatch(getItemsAround(range[1]))


    }
}

export function getItemsAround(next_index) {
    return (dispatch, getState) => {
        const {
            player: {
                queue,
                currentPlaylistId
            },
            entities: {
                track_entities,
                playlist_entities
            },
            objects
        } = getState()

        const playlists = objects[OBJECT_TYPES.PLAYLISTS] || {}
        const currentPlaylist = playlists[currentPlaylistId]

        const items_to_fetch = []

        const lowBound = next_index - 3;
        const highBound = next_index + 3;

        // Get playlists
        for (let i = (lowBound < 0 ? 0 : next_index); i < (highBound > queue.length ? queue.length : highBound); i += 1) {
            const n_track = queue[i]
            if (n_track && n_track.id) {

                const playlist = playlist_entities[n_track.playlistId]

                if (playlist) {
                    dispatch(getPlaylistObject(n_track.playlistId, i))
                }

                if (!track_entities[n_track.id]) {
                    items_to_fetch.push(n_track.id)
                }

                if (currentPlaylist.fetchedItems && currentPlaylist.fetchedItems - 10 < i && currentPlaylist.fetchedItems !== currentPlaylist.items.length) {
                    dispatch(fetchPlaylistTracks(currentPlaylistId, 30))
                }
            }
        }

        if (items_to_fetch.length) {
            dispatch(fetchTracks(items_to_fetch))
        }
    }
}