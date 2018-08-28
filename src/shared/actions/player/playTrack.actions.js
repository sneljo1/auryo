/* eslint-disable promise/catch-or-return,no-shadow */
import { ipcRenderer } from "electron";
import { OBJECT_TYPES } from '../../constants';
import { EVENTS } from '../../constants/events';
import { getCurrentPosition } from '../../utils/playerUtils';
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
 * @param trackPlaylist
 * @param force_set_playlist
 * @returns {function(*, *)}
 */
export function playTrack(playlistId, trackId, trackPlaylist, force_set_playlist, changeType) {
    return (dispatch, getState) => {

        const {
            player: {
                currentPlaylistId
            }
        } = getState()

        let nextTrack

        if (typeof trackId === 'object') {
            nextTrack = trackId
            trackId = nextTrack.id
        } else {
            nextTrack = {
                id: trackId,
                playlistId: (trackPlaylist ? trackPlaylist.id : playlistId)
            }
        }

        /**
         * If playlist isn't current, set current & add items to queue
         */

        let promise = Promise.resolve()
        if (currentPlaylistId !== playlistId || force_set_playlist) {
            promise = dispatch(setCurrentPlaylist(playlistId, force_set_playlist && nextTrack ? nextTrack : null))
        }

        promise.then(() => {
            const {
                objects,
                player: {
                    queue,
                    playingTrack
                }
            } = getState()

            const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS] || {}
            let position = getCurrentPosition(queue, playingTrack)
            position = (typeof force_set_playlist === 'number' ? force_set_playlist : undefined) || getCurrentPosition(queue, nextTrack)

            if (position !== -1) {
                dispatch(getItemsAround(position, true))
            }

            if (!trackPlaylist) {
                const track_playlist_obj = playlist_objects[playlistId]

                if (track_playlist_obj && position + 10 >= queue.length && track_playlist_obj.nextUrl) {
                    dispatch(fetchMore(playlistId, OBJECT_TYPES.PLAYLISTS))
                        .then(() => {
                            dispatch(setPlayingTrack(nextTrack, position, changeType))
                        })
                } else {

                    dispatch(setPlayingTrack(nextTrack, position, changeType))
                }


            } else if (trackPlaylist && trackPlaylist.kind === 'playlist') {

                const track_playlist_obj = playlist_objects[trackPlaylist.id]

                if (!track_playlist_obj) {

                    if (trackPlaylist.track_count > 0) {

                        dispatch(getPlaylistObject(trackPlaylist.id, nextTrack))
                            .then(() => {
                                const {
                                    objects,
                                    player: {
                                        queue
                                    }
                                } = getState()

                                const playlists = objects[OBJECT_TYPES.PLAYLISTS] || {}
                                const { items: [firstItem] } = playlists[trackPlaylist.id]

                                nextTrack.id = firstItem

                                const position = getCurrentPosition(queue, nextTrack)

                                dispatch(setPlayingTrack(nextTrack, position, changeType))

                            })
                    }

                } else {
                    const {
                        objects
                    } = getState()

                    const playlists = objects[OBJECT_TYPES.PLAYLISTS] || {}
                    const { items: [firstItem] } = playlists[trackPlaylist.id]

                    if (!track_playlist_obj.isFetching && !track_playlist_obj.items.length && trackPlaylist.track_count !== 0) {
                        throw new Error('This playlist is empty or not available via a third party!')
                    } else {
                        // If queue doesn't contain playlist yet

                        if (force_set_playlist) {
                            nextTrack.id = firstItem
                            position = getCurrentPosition(queue, nextTrack)
                        } else {
                            position = getCurrentPosition(queue, nextTrack)
                        }

                        dispatch(setPlayingTrack(nextTrack, position, changeType))

                    }
                }

            }
            
            ipcRenderer.send(EVENTS.PLAYER.STATUS_CHANGED)
        })

    }
}