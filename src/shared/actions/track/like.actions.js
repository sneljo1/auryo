import { ipcRenderer } from "electron";
import moment from 'moment';
import React from 'react';
import { toastr } from 'react-redux-toastr';
import ReactImageFallback from '../../../renderer/modules/_shared/FallbackImage';
import fetchToJson from '../../api/helpers/fetchToJson';
import { actionTypes, IMAGE_SIZES } from '../../constants';
import { EVENTS } from '../../constants/events';
import { SC } from '../../utils';
/**
 * Toggle like of a specific track
 *
 * @param trackId
 * @param playlist
 * @returns {function(*, *)}
 */
export function toggleLike(trackId, playlistParam) {
    return (dispatch, getState) => {
        const { auth: { likes, me } } = getState()

        let playlist = playlistParam;

        if (playlist instanceof Event) {
            playlist = false
        }

        const liked = !SC.hasID(trackId, (playlist ? likes.playlist : likes.track))

        dispatch({
            type: actionTypes.AUTH_SET_LIKE,
            payload: fetchToJson(playlist ? SC.updatePlaylistLikeUrl(me.id, trackId) : SC.updateLikeUrl(trackId), {
                method: (liked) ? 'PUT' : 'DELETE'
            }).then(() => {

                const { entities: { track_entities, playlist_entities } } = getState()
                let obj
                if (playlist) {
                    obj = playlist_entities[trackId]
                } else {
                    obj = track_entities[trackId]
                }

                if (liked) {
                    toastr.info(obj.title, `Liked ${playlist ? 'playlist' : 'track'}`, {
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
            .then(() => ipcRenderer.send(EVENTS.TRACK.LIKED))
            .catch(err => {

                if (err.response && err.response.status === 429) {
                    return err.response.json()
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

export default toggleLike