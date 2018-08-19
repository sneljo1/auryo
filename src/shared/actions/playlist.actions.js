import { normalize, schema } from 'normalizr';
import React from 'react';
import { actions as toastrActions, toastr } from 'react-redux-toastr';
import { Link } from 'react-router-dom';
import { hide } from 'redux-modal';
import ReactImageFallback from '../../renderer/modules/_shared/FallbackImage';
import fetchPlaylist from '../api/fetchPlaylist';
import fetchPlaylists from '../api/fetchPlaylists';
import fetchTrackList from '../api/fetchTrackList';
import fetchToJson from '../api/helpers/fetchToJson';
import { actionTypes, IMAGE_SIZES, OBJECT_TYPES, PLAYLISTS } from '../constants';
import { trackSchema } from '../schemas';
import { SC } from '../utils';
import { getPlaylist, setObject } from './objectActions';

/**
 * Get stream of feed from the authenticated user
 *
 * @returns {function(*, *): *}
 */
export function getAuthFeed(refresh) {
    return (dispatch, getState) => {
        const { config: { hideReposts } } = getState()
        // dispatch(initFeedUpdater());

        return dispatch(getPlaylist(SC.getFeedUrl(hideReposts ? 40 : 20), PLAYLISTS.STREAM, refresh))
    }
}

/**
 * Fetch stream and process new songs
 *
 * @param stream
 * @param url - Future url from soundcloud API
 * @returns {function(*, *)}
 */
// eslint-disable-next-line
function updateFeed(stream, url) {
    return (dispatch, getState) => {
        const {
            auth
        } = getState()

        const feed = stream.items
            .reduce((obj, songId) => Object.assign({}, obj, {
                [songId]: 1
            }), {})

        const newfeedItems = auth.newFeedItems
            .reduce((obj, songId) => Object.assign({}, obj, {
                [songId]: 1
            }), {})

        const old_items = Object.assign({}, feed, newfeedItems)

        return dispatch({
            type: actionTypes.AUTH_SET_NEW_FEED_ITEMS,
            payload: fetchTrackList(url, old_items)
                .then(({
                    normalized,
                    json
                }) => ({
                    futureUrl: SC.appendToken(json.future_href),
                    entities: normalized.entities,
                    result: normalized.result,
                    object_id: PLAYLISTS.STREAM,
                    object_type: OBJECT_TYPES.PLAYLISTS
                }))
        })
    }
}


/**
 * Get playlists from the authenticated user
 *
 * @returns {function(*=)}
 */
export function getAuthPlaylists() {
    return dispatch => dispatch({
        type: actionTypes.AUTH_SET_PLAYLISTS,
        payload: {
            promise: fetchPlaylists()
                .then(({
                    normalized
                }) => {

                    normalized.result.forEach(playlistId => {
                        const playlist = normalized.entities.playlist_entities[playlistId]
                        dispatch(setObject(
                            playlistId,
                            OBJECT_TYPES.PLAYLISTS, {},
                            playlist.tracks
                        ))
                    })

                    return {
                        result: normalized.result,
                        entities: normalized.entities
                    }
                })
        }
    })
}

/**
 * Add track to certain playlist
 *
 * @param trackId
 * @param playlistId
 * @returns {function(*, *)}
 */
export function togglePlaylistTrack(trackId, playlistId) {
    return (dispatch, getState) => {
        const {
            objects,
            entities: {
                playlist_entities }
        } = getState()

        const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS]
        const playlist_object = playlist_objects[playlistId]
        const playlist_entitity = playlist_entities[playlistId]

        let new_items = []

        const item_index = playlist_object.items.indexOf(trackId)

        let add = true

        if (item_index === -1) {
            new_items = [trackId, ...playlist_object.items]
        } else {
            new_items = [...playlist_object.items.filter(id => id !== trackId)]
            add = false
        }

        dispatch({
            type: actionTypes.OBJECT_UPDATE_ITEMS,
            payload: {
                promise: fetchToJson(SC.getPlaylistupdateUrl(playlistId), {
                    method: 'PUT',
                    body: JSON.stringify({
                        playlist: {
                            tracks: new_items
                        }
                    })
                }).then(() => {

                    const {
                        entities: {
                            track_entities
                        }
                    } = getState()

                    const track = track_entities[trackId]

                    dispatch(toastrActions.add({
                        id: `addtoplaylist-${add}-${playlist_entitity.id}`, // If not provided we will add one.
                        type: 'info',
                        title: track.title,
                        options: {
                            timeOut: 3000,
                            icon: (
                                <ReactImageFallback src={SC.getImageUrl(track, IMAGE_SIZES.MEDIUM)} />
                            ),
                            showCloseButton: false,
                            component: (
                                <div>
                                    {`Track ${add ? 'added to' : 'removed from'} playlist `} <Link
                                        onClick={() => {
                                            dispatch(toastrActions.remove(`addtoplaylist-${add}-${playlist_entitity.id}`))
                                            dispatch(hide('addToPlaylist'))
                                        }}
                                        to={`/playlist/${playlist_entitity.id}`}>{playlist_entitity.title}</Link>
                                </div>
                            )
                        }
                    }))


                    return {
                        object_id: playlistId,
                        object_type: OBJECT_TYPES.PLAYLISTS,
                        items: new_items,
                        entities: {
                            playlist_entities: {
                                [playlistId]: {
                                    track_count: item_index === -1 ? playlist_entitity.track_count + 1 : playlist_entitity.track_count - 1,
                                    duration: item_index === -1 ? playlist_entitity.duration + track.duration : playlist_entitity.duration - track.duration
                                }
                            }
                        }
                    }
                }),
                data: {
                    object_id: playlistId,
                    object_type: OBJECT_TYPES.PLAYLISTS
                }
            }
        })


    }
}

/**
 * Fetch new playlist if needed
 *
 * @param playlistId
 * @returns {function(*, *)}
 */
export function fetchPlaylistIfNeeded(playlistId) {
    return (dispatch, getState) => {
        const {
            objects
        } = getState()

        const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS]
        const playlist_object = playlist_objects[playlistId]

        if (!playlist_object || (playlist_object && playlist_object.fetchedItems === undefined)) {
            return dispatch({
                type: actionTypes.OBJECT_SET,
                payload: {
                    promise: fetchPlaylist(SC.getPlaylistTracksUrl(playlistId), playlistId)
                        .then(({
                            normalized,
                            json
                        }) => {
                            const playlist = normalized.entities.playlist_entities[playlistId]

                            return {
                                object_id: playlistId,
                                object_type: OBJECT_TYPES.PLAYLISTS,
                                entities: normalized.entities,
                                result: playlist.tracks,
                                nextUrl: (json.next_href) ? SC.appendToken(json.next_href) : null,
                                futureUrl: (json.future_href) ? SC.appendToken(json.future_href) : null,
                                fetchedItems: json.tracks.filter((t) => t.user !== undefined).length
                            }
                        }),
                    data: {
                        object_id: playlistId,
                        object_type: OBJECT_TYPES.PLAYLISTS
                    }
                }
            })
                .then(() => {
                    dispatch(fetchPlaylistTracks(playlistId))
                })
        }


        return Promise.resolve({ fetched: false })
    }
}

/**
 * Fetch new chart if needed
 *
 * @returns {function(*, *)}
 * @param object_id
 * @param sortType
 */
export function fetchChartsIfNeeded(object_id, sortType) {
    return (dispatch, getState) => {
        const { objects } = getState()

        const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS]
        const playlist_object = playlist_objects[object_id]

        if (!playlist_object) {
            dispatch(getPlaylist(SC.getChartsUrl(object_id.split('_')[0], sortType, 25), object_id))
        }
    }
}

export function canFetchPlaylistTracks(playlistId) {
    return (dispatch, getState) => {
        const {
            objects
        } = getState()

        const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS]
        const playlist_object = playlist_objects[playlistId]


        if (!playlist_object || playlist_object.fetchedItems === playlist_object.items.length || playlist_object.isFetching) {
            return false
        }

        let new_count = playlist_object.fetchedItems + 20

        if (new_count > playlist_object.items.length) {
            new_count = playlist_object.items.length
        }

        const ids = playlist_object.items.slice(playlist_object.fetchedItems, new_count)

        return !!ids.length


    }
}

export function fetchPlaylistTracks(playlistId, size = 20, idsParam = null) {
    return (dispatch, getState) => {
        const {
            objects
        } = getState()

        const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS]
        const playlist_object = playlist_objects[playlistId]

        let ids = idsParam;


        if (!playlist_object) {
            dispatch(fetchPlaylistIfNeeded(playlistId))

            return
        }

        if ((playlist_object.fetchedItems === playlist_object.items.length || playlist_object.isFetching) && !ids) {
            return
        }

        if (!ids) {
            let new_count = playlist_object.fetchedItems + size

            if (new_count > playlist_object.items.length) {
                new_count = playlist_object.items.length
            }

            ids = playlist_object.items.slice(playlist_object.fetchedItems, new_count)
        }

        if (ids.length) {
            return dispatch({
                type: actionTypes.OBJECT_SET_TRACKS,
                payload: {
                    promise: fetchToJson(SC.getTracks(ids))
                        .then(tracks => {

                            const normalized = normalize(tracks, new schema.Array(trackSchema))

                            return {
                                object_id: playlistId,
                                object_type: OBJECT_TYPES.PLAYLISTS,
                                entities: normalized.entities,
                                fetchedItems: size
                            }
                        }),
                    data: {
                        object_id: playlistId
                    }
                }
            })
        }
    }
}

export function fetchTracks(ids = []) {
    return (dispatch) => {
        if (ids.length) {
            dispatch({
                type: actionTypes.SET_TRACKS,
                payload: {
                    promise: fetchToJson(SC.getTracks(ids))
                        .then(tracks => {

                            const normalized = normalize(tracks, new schema.Array(trackSchema))

                            return {
                                entities: normalized.entities
                            }
                        }),
                    data: {
                        entities: {
                            track_entities: ids.reduce((obj, id) => ({
                                ...obj,
                                [id]: {
                                    loading: true
                                }
                            }), {})
                        }
                    }
                }
            })
        }
    }
}

/**
 *
 * @param title
 * @param type ["public"|"private"]
 * @param tracks
 */
export function createPlaylist(title, type, tracks) {
    return () => fetchToJson(SC.getPlaylistUrl(), {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            playlist: {
                title,
                sharing: type,
                tracks
            }
        })
    })
        .then(res => {
            console.log(res);
        });

}

export function deletePlaylist(playlistId) {
    return (dispatch, getState) => {
        const {
            entities: {
                playlist_entities
            }
        } = getState()

        const playlist_entitity = playlist_entities[playlistId]

        if (playlist_entitity) {

            fetchToJson(SC.getPlaylistDeleteUrl(playlistId), {
                method: 'DELETE'
            })
                .then(() => {
                    toastr.info(playlist_entitity.title, 'Playlist has been deleted!');
                })
                .catch(() => {
                    toastr.error(playlist_entitity.title, 'Unable to delete playlist!');
                })
        }
    }
}