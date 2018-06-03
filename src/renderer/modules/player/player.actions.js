import { actionTypes, OBJECT_TYPES, PLAYER_STATUS } from '../../../shared/constants/index'

import { fetchPlaylistIfNeeded } from '../../../shared/actions/index'
import { fetchPlaylistTracks, fetchTracks } from '../../../shared/actions/playlist.actions'
import flattenDeep from 'lodash/flattenDeep'
import { fetchMore } from '../../../shared/actions/objectActions'
import { playTrack } from '../../../shared/actions/player/playTrack.actions'
import { PLAYLISTS } from '../../../shared/constants/playlist'
import { getCurrentPosition } from '../../../shared/utils/playerUtils'
import { windowRouter } from '../../../shared/utils/router'
import { EVENTS } from '../../../shared/constants/events'
import { schema } from 'normalizr'
import { IMAGE_SIZES } from '../../../shared/constants'
import { toastr } from 'react-redux-toastr'
import { SC } from '../../../shared/utils'
import ReactImageFallback from '../_shared/FallbackImage'
import React from 'react'

const obj_type = OBJECT_TYPES.PLAYLISTS

export * from '../../../shared/actions/player/playTrack.actions'
export * from '../../../shared/actions/player/changeTrack.actions'

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

        const playlists = objects[obj_type] || {}
        const track_playlist_obj = playlists[playlistId]


        if (!track_playlist_obj) {

            return dispatch(fetchPlaylistIfNeeded(playlistId))
                .then((result) => {
                    const {
                        objects,
                        entities: {
                            playlist_entities
                        }
                    } = getState()

                    const playlists = objects[obj_type] || {}
                    const current_playlist = playlists[playlistId]
                    const current_playlist_ent = playlist_entities[playlistId]

                    if (!current_playlist.isFetching && !current_playlist.items.length && current_playlist_ent.track_count !== 0) {
                        throw new Error('This playlist is empty or not available via a third party!')
                    }

                    // Try and fetch all playlist tracks
                    if (current_playlist.fetchedItems < current_playlist.items.length) {
                        dispatch(fetchPlaylistTracks(playlistId, 50))
                    }

                    return result
                })


        } else {

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
export function toggleStatus(new_status) {
    return (dispatch, getState) => {
        const {
            player: {
                status,
                currentPlaylistId
            },
            objects
        } = getState()

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
        let playlist_object = playlists[playlistId]
        const { playlist_entities } = entities

        let playlist_pos = []

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
                                        return {
                                            id: trackId,
                                            playlistId: id
                                        }
                                    })
                                }

                                return {
                                    id,
                                    playlistId
                                }
                            })),
                        next_track,
                        playlist_pos
                    })

                }
            })

        } else {
            return Promise.resolve()
        }


    }
}

/**
 * Set currentrackIndex & start playing
 *
 * @param next_track
 * @param position
 */
export function setPlayingTrack(next_track, position) {
    return (dispatch, getState) => {

        dispatch({
            type: actionTypes.PLAYER_SET_TRACK,
            payload: {
                next_track,
                status: PLAYER_STATUS.PLAYING,
                position
            }
        })

        windowRouter.send(EVENTS.PLAYER.TRACK_CHANGED, next_track.id)

    }

}

/**
 * Add up next feature
 *
 * @param trackId
 * @param track_playlist
 * @param remove
 */
export function addUpNext(trackId, track_playlist, remove = null) {
    return (dispatch, getState) => {
        const {
            player: {
                queue,
                currentPlaylistId,
                playingTrack

            },
            entities: {
                track_entities,
                playlist_entities
            }
        } = getState()

        let next_track, next_list

        if (typeof trackId === 'object') {
            next_track = trackId
            trackId = next_track.id
        } else {
            next_track = {
                id: trackId,
                playlistId: (track_playlist ? track_playlist.id : currentPlaylistId)
            }
        }

        let track = track_entities[trackId]

        if (track_playlist) {
            track = playlist_entities[trackId]

            next_list = track.tracks.map((id) => ({
                id,
                playlistId: trackId
            }))
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
                    next: track_playlist ? next_list : [next_track],
                    remove,
                    position: getCurrentPosition(queue, playingTrack),
                    playlist: track_playlist
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
            objects
        } = getState()
        const {
            queue,
            currentPlaylistId
        } = player

        if (queue.length < range[1] + 5) {
            dispatch(fetchMore(currentPlaylistId, OBJECT_TYPES.PLAYLISTS))
        }

        dispatch(getItemsAround(range[1], true))


    }
}

export function getItemsAround(next_index, play) {
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

        let items_to_fetch = []

        // Get playlists
        for (let i = (next_index - 3); i < (next_index + 3); i++) {
            const n_track = queue[i]
            if (i > 0 && i < queue.length && n_track && n_track.id) {

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