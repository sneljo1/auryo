/* eslint-disable promise/catch-or-return,no-shadow */
import { OBJECT_TYPES } from '../../constants';
import { EVENTS } from '../../constants/events';
import { getCurrentPosition } from '../../utils/playerUtils';
import { windowRouter } from '../../utils/router';
import { fetchMore } from '../objectActions';
import { getItemsAround, getPlaylistObject, setCurrentPlaylist, setPlayingTrack } from "./playerActions";

export function playTrackFromIndex(playlistId, trackIndex, trackPlaylist, forceSetPlaylist) {
    return (dispatch, getState) => {
        const { player: { queue } } = getState()

        const track = queue[trackIndex]

        if (track) {
            dispatch(playTrack(playlistId, track.id, trackPlaylist, forceSetPlaylist))
        }

    }
}

/**
 * Function for playing a new track or playlist
 *
 * Before playing the current track, check if the track passed to the function is a playlist. If so, save the parent
 * playlist and execute the function with the child playlist. If the new playlist doesn't exist, fetch it before moving on.
 *
 * @param playlistId
 * @param trackId
 * @param track_playlist
 * @param force_set_playlist
 * @returns {function(*, *)}
 */
export function playTrack(playlistId, trackIdParam, track_playlist, force_set_playlist) {
    return (dispatch, getState) => {

        const {
            player: {
                currentPlaylistId
            }
        } = getState()

        let next_track
        let trackId = trackIdParam;

        if (typeof trackId === 'object') {
            next_track = trackId
            trackId = next_track.id
        } else {
            next_track = {
                id: trackId,
                playlistId: (track_playlist ? track_playlist.id : playlistId)
            }
        }

        /**
         * If playlist isn't current, set current & add items to queue
         */

        let promise = Promise.resolve()
        if (currentPlaylistId !== playlistId || force_set_playlist) {
            promise = dispatch(setCurrentPlaylist(playlistId, force_set_playlist && next_track ? next_track : null))
        }

        promise.then(() => {
            const {
                objects,
                player: {
                    queue,
                    playingTrack
                }
            } = getState()

            const playlists = objects[OBJECT_TYPES.PLAYLISTS] || {}
            let position = getCurrentPosition(queue, playingTrack)
            position = (typeof force_set_playlist === 'number' ? force_set_playlist : undefined) || getCurrentPosition(queue, next_track)

            if (position !== -1) {
                dispatch(getItemsAround(position, true))
            }

            if (!track_playlist) {
                const track_playlist_obj = playlists[playlistId]

                if (track_playlist_obj && position + 10 >= queue.length && track_playlist_obj.nextUrl) {
                    dispatch(fetchMore(playlistId, OBJECT_TYPES.PLAYLISTS))
                        .then(() => {
                            dispatch(setPlayingTrack(next_track, position))
                        })
                } else {

                    dispatch(setPlayingTrack(next_track, position))
                }


            } else if (track_playlist && track_playlist.kind === 'playlist') {

                const track_playlist_obj = playlists[track_playlist.id]

                if (!track_playlist_obj) {

                    if (track_playlist.track_count > 0) {

                        dispatch(getPlaylistObject(track_playlist.id, next_track))
                            .then(() => {
                                const {
                                    objects,
                                    player: {
                                        queue
                                    }
                                } = getState()

                                const playlists = objects[OBJECT_TYPES.PLAYLISTS] || {}
                                const { items: [firstItem] } = playlists[track_playlist.id]

                                next_track.id = firstItem

                                const position = getCurrentPosition(queue, next_track)

                                dispatch(setPlayingTrack(next_track, position))

                            })
                    }

                } else {
                    const {
                        objects
                    } = getState()

                    const playlists = objects[OBJECT_TYPES.PLAYLISTS] || {}
                    const { items: [firstItem] } = playlists[track_playlist.id]

                    if (!track_playlist_obj.isFetching && !track_playlist_obj.items.length && track_playlist.track_count !== 0) {
                        throw new Error('This playlist is empty or not available via a third party!')
                    } else {
                        // If queue doesn't contain playlist yet

                        if (force_set_playlist) {
                            next_track.id = firstItem
                            position = getCurrentPosition(queue, next_track)

                        } else {

                            position = getCurrentPosition(queue, next_track)
                        }


                        dispatch(setPlayingTrack(next_track, position))

                    }
                }

            }

            windowRouter.send(EVENTS.PLAYER.STATUS_CHANGED)
        })

    }
}