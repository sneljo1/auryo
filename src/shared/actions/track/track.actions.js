export * from './like.actions'

import { SC } from '../../utils'
import fetchTrack from '../../api/fetchTrack'
import { actionTypes, OBJECT_TYPES, RELATED_PLAYLIST_SUFFIX } from '../../../shared/constants'
import { getComments, getRelatedPlaylist } from '../objectActions'

/**
 * Check if track exists and has comments and related tracks. If not fetch those.
 *
 * @param trackID
 * @returns {function(*, *)}
 */
export function fetchTrackIfNeeded(trackID) {
    return (dispatch, getState) => {
        const { entities: { track_entities }, objects } = getState()
        const playlists = objects[OBJECT_TYPES.PLAYLISTS] || {}
        const comments = objects[OBJECT_TYPES.COMMENTS] || {}
        const current_playlist = String(trackID + RELATED_PLAYLIST_SUFFIX)

        const track = track_entities[trackID]

        if (!track || (track && !track.playback_count)) {
            dispatch(getTrack(trackID))
        }

        if (!(current_playlist in playlists)) {
            dispatch(getRelatedPlaylist(SC.getRelatedUrl(trackID), trackID + RELATED_PLAYLIST_SUFFIX, trackID))
        }

        const comment = comments[trackID] || {}

        if (comments && !comment.isFetching && !comment.items) {
            dispatch(getComments(trackID))
        }

    }
}

/**
 * Get & save track
 *
 * @param trackID Track to fetch
 * @returns {function(*)}
 */
function getTrack(trackID) {
    return dispatch => {
        return dispatch({
            type: actionTypes.TRACK_ADD,
            payload: fetchTrack(trackID)
                .then(({ normalized, json }) => {
                    return {
                        entities: normalized.entities
                    }
                })
        })
    }
}