import { actionTypes, OBJECT_TYPES } from '../../shared/constants'
import { SC } from '../utils'
import fetchPlaylist from '../api/fetchPlaylist'
import fetchComments from '../api/fetchComments'
import { fetchPlaylistTracks } from './playlist.actions'
import flattenDeep from 'lodash/flattenDeep'

/**
 * Check if there is more to fetch, if so, fetch more
 *
 * @param object_id
 * @param type
 * @param chart
 * @returns {function(*, *)}
 */
export function fetchMore(object_id, type, chart) {
    return (dispatch, getState) => {
        const { objects } = getState()
        const object_group = objects[type] || {}

        if (canFetchMore(object_group[object_id])) {
            const nextUrl = object_group[object_id].nextUrl

            if (nextUrl) {
                switch (type) {
                    case OBJECT_TYPES.PLAYLISTS:
                        return dispatch(getPlaylist(nextUrl, object_id))
                    case OBJECT_TYPES.COMMENTS:
                        return dispatch(getComments(nextUrl, object_id))
                }
            }
        }

        return Promise.resolve()
    }
}

export function canFetchMoreOf(object_id, type) {
    return (dispatch, getState) => {
        const { objects } = getState()
        const object_group = objects[type] || {}

        return canFetchMore(object_group[object_id])
    }

}

/**
 * Check if the current playlist isn't fetching & has a next Url
 *
 * @param current
 * @returns {*|boolean}
 */
function canFetchMore(current) {
    return current && (current.nextUrl !== null) && !current.isFetching

}

/**
 * Get playlist uring url & id
 *
 * @param url
 * @param object_id
 * @param refresh
 * @returns {function(*, *)}
 */
export function getPlaylist(url, object_id, refresh) {
    return (dispatch, getState) => {
        const { objects, config: { hideReposts } } = getState()

        const playlists = objects[OBJECT_TYPES.PLAYLISTS] || {}
        const currentPlaylistObject = playlists[object_id]
        let old_items = []
        if (currentPlaylistObject) {
            old_items = [...currentPlaylistObject.items]
        }

        return dispatch({
            type: actionTypes.OBJECT_SET,
            payload: {
                promise: fetchPlaylist(url, object_id, hideReposts)
                    .then(({ normalized, json }) => {

                        return {
                            object_id,
                            object_type: OBJECT_TYPES.PLAYLISTS,
                            entities: normalized.entities,
                            result: normalized.result,
                            nextUrl: (json.next_href) ? SC.appendToken(json.next_href) : null,
                            futureUrl: (json.future_href) ? SC.appendToken(json.future_href) : null,
                            refresh
                        }
                    }),
                data: {
                    object_id,
                    object_type: OBJECT_TYPES.PLAYLISTS
                }
            }
        })
            .then(({ value }) => {
                const { player: { currentPlaylistId } } = getState()

                if (object_id === currentPlaylistId && value.result.length) {

                    if (value && value.result) {

                        const { player: { currentPlaylistId, queue }, entities: { playlist_entities } } = getState()

                        const result = value.result//.filter(i => old_items.indexOf(i) === -1)

                        if (result.length) {
                            console.debug('QUEUE insert getplaylist')
                            dispatch({
                                type: actionTypes.PLAYER_QUEUE_INSERT,
                                payload: {
                                    items: flattenDeep(result
                                        .filter(trackIdSchema => trackIdSchema.schema !== 'users')
                                        .map((trackIdSchema, i) => {
                                            const id = trackIdSchema.id || trackIdSchema

                                            const playlist = playlist_entities[id]
                                            const playlist_object = playlists[id]

                                            if (playlist) {

                                                if (!playlist_object) {

                                                    dispatch({
                                                        type: actionTypes.OBJECT_SET,
                                                        payload: {
                                                            object_id: id,
                                                            object_type: OBJECT_TYPES.PLAYLISTS,
                                                            result: playlist.tracks,
                                                            fetchedItems: 0
                                                        }
                                                    })

                                                    dispatch(fetchPlaylistTracks(id, 50))

                                                }

                                                return playlist.tracks.map(trackId => {
                                                    return {
                                                        id: trackId,
                                                        playlistId: id
                                                    }
                                                })
                                            }

                                            return {
                                                id,
                                                playlistId: currentPlaylistId
                                            }
                                        })),
                                    index: queue.length
                                }
                            })
                        }
                    }


                }
            })
    }
}

/**
 * Get related playlist
 *
 * @param url
 * @param object_id
 * @param trackID
 * @returns {{type, payload: {promise: Promise, data: {object_id: *, object_type: string}}}}
 */
export function getRelatedPlaylist(url, object_id, trackID) {
    return {
        type: actionTypes.OBJECT_SET,
        payload: {
            promise: fetchPlaylist(url, object_id)
                .then(({ normalized, json }) => {
                    return {
                        object_id,
                        object_type: OBJECT_TYPES.PLAYLISTS,
                        entities: normalized.entities,
                        result: [parseInt(trackID), ...normalized.result],
                        nextUrl: (json.next_href) ? SC.appendToken(json.next_href) : null,
                        futureUrl: (json.future_href) ? SC.appendToken(json.future_href) : null
                    }
                }),
            data: {
                object_id,
                object_type: OBJECT_TYPES.PLAYLISTS
            }
        }
    }
}

/**
 * get and save comments
 *
 * @param url
 * @param object_id
 * @returns {function(*, *)}
 */
export function getComments(url, object_id = null) {
    return (dispatch, getState) => {
        const { objects } = getState()
        const comments = objects[OBJECT_TYPES.COMMENTS]

        if (!object_id) {
            object_id = url
        }

        if (comments[object_id] && comments[object_id].isFetching) return

        return dispatch({
            type: actionTypes.OBJECT_SET,
            payload: {
                promise: fetchComments(object_id == url ? SC.getCommentsUrl(object_id) : url)
                    .then(({ normalized, json }) => {
                        return {
                            object_id,
                            object_type: OBJECT_TYPES.COMMENTS,
                            entities: normalized.entities,
                            result: normalized.result,
                            nextUrl: (json.next_href) ? SC.appendToken(json.next_href) : null,
                            futureUrl: (json.future_href) ? SC.appendToken(json.future_href) : null
                        }

                    }),
                data: {
                    object_id,
                    object_type: OBJECT_TYPES.COMMENTS
                }
            }
        })
    }
}

/**
 * Save playlist
 *
 * @param object_id
 * @param {String} object_type -  PLAYLISTS | COMMENTS
 * @param entities  - entities from normalizing
 * @param result    - result from normalizing
 * @param nextUrl   - url for more items
 * @param futureUrl - url for future items
 * @returns {{type: *, payload: *}}
 */
export function setObject(object_id, object_type, entities, result, nextUrl = null, futureUrl = null) {
    return {
        type: actionTypes.OBJECT_SET,
        payload: {
            object_id,
            object_type,
            entities,
            result,
            nextUrl: (nextUrl) ? SC.appendToken(nextUrl) : null,
            futureUrl: (futureUrl) ? SC.appendToken(futureUrl) : null
        }
    }
}
