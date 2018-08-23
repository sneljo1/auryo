import React from 'react';
import { toastr } from 'react-redux-toastr';
import ReactImageFallback from '../../../renderer/modules/_shared/FallbackImage';
import fetchToObject from '../../api/helpers/fetchToObject';
import { actionTypes, IMAGE_SIZES } from '../../constants';
import { EVENTS } from '../../constants/events';
import { SC } from '../../utils';
import { windowRouter } from '../../utils/router';

/**
 * Get and save auth reposts
 *
 * @returns {{type, payload}}
 */
export function getAuthReposts() {
    return {
        type: actionTypes.AUTH_SET_REPOSTS,
        payload: fetchToObject(SC.getRepostIdsUrl())
    }
}

/**
 * Toggle repost of a specific track
 *
 * @param trackId
 * @param playlist
 * @returns {function(*, *)}
 */

export function toggleRepost(trackId, playlistParam) {
    return (dispatch, getState) => {
        const { auth: { reposts } } = getState()

        let playlist = playlistParam

        if (typeof playlist !== 'boolean') {
            playlist = false
        }

        if (playlist) {
            throw new Error('Not implemented')
        }

        const reposted = !((trackId in reposts) ? reposts[trackId] : 0)

        return dispatch({
            type: actionTypes.AUTH_SET_REPOST,
            payload: fetch(playlist ? null : SC.updateRepostUrl(trackId), {
                method: (reposted) ? 'PUT' : 'DELETE'
            }).then(() => {
                const { entities: { track_entities, playlist_entities } } = getState();
                let obj;
                if (playlist) {
                    obj = playlist_entities[trackId];
                }
                else {
                    obj = track_entities[trackId];
                }
                if (reposted) {
                    toastr.info(obj.title, 'Reposted track', {
                        icon: (<ReactImageFallback src={SC.getImageUrl(obj, IMAGE_SIZES.MEDIUM)} />),
                        showCloseButton: false
                    });
                }
                return {
                    trackId,
                    reposted,
                    playlist
                };
            })
        })
            .then(() => {
                windowRouter.send(EVENTS.TRACK.REPOSTED)
            })

    }
}