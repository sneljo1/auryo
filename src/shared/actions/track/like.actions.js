import { SC } from '../../utils'
import { actionTypes } from '../../../shared/constants'
import fetchToJson from '../../api/helpers/fetchToJson'
import { windowRouter } from '../../utils/router'
import { EVENTS } from '../../constants/events'
import moment from 'moment'
import { toastr } from 'react-redux-toastr'
import ReactImageFallback from '../../../renderer/modules/_shared/FallbackImage'
import { IMAGE_SIZES } from '../../constants'
import React from 'react'

/**
 * Toggle like of a specific track
 *
 * @param trackId
 * @param playlist
 * @returns {function(*, *)}
 */
export function toggleLike(trackId, playlist) {
    return (dispatch, getState) => {
        const { auth: { likes, me } } = getState()

        if (playlist instanceof Event) {
            playlist = false
        }


        const liked = !SC.hasID(trackId, (playlist ? likes.playlist : likes.track))

        console.log(actionTypes.AUTH_SET_LIKE, liked)

        dispatch({
            type: actionTypes.AUTH_SET_LIKE,
            payload: fetchToJson(playlist ? SC.updatePlaylistLikeUrl(me.id, trackId) : SC.updateLikeUrl(trackId), {
                method: (liked) ? 'PUT' : 'DELETE'
            }).then(json => {

                const { entities: { track_entities, playlist_entities } } = getState()
                let obj
                if (playlist) {
                    obj = playlist_entities[trackId]
                } else {
                    obj = track_entities[trackId]
                }

                if (liked) {
                    toastr.info(obj.title, 'Liked ' + (playlist ? 'playlist' : 'track'), {
                        icon: (
                            <ReactImageFallback src={SC.getImageUrl(obj, IMAGE_SIZES.MEDIUM)} />
                        ),
                        showCloseButton: false
                    })
                }

                return {
                    trackId,
                    liked,
                    playlist
                }
            })
        })
            .then(() => {
                windowRouter.send(EVENTS.TRACK.LIKED)
            })
            .catch(err => {

                if (err.response && err.response.status === 429) {
                    err.response.json()
                        .then((res) => {
                            const error = res.errors[0]

                            if (error.reason_phrase === 'info: too many likes') {
                                toastr.error('Unable to like track', `You have liked too quick, you can like again ${moment(error.release_at).fromNow()}`)
                            }
                        })

                }
            })

    }
}