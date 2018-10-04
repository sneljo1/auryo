import * as moment from 'moment';
import { toastr } from 'react-redux-toastr';
import { ThunkResult } from '../../../types';
import fetchTrack from '../../api/fetchTrack';
import fetchToJson from '../../api/helpers/fetchToJson';
import { RELATED_PLAYLIST_SUFFIX } from '../../constants';
import { SC } from '../../utils';
import { IPC } from '../../utils/ipc';
import { AuthActionTypes } from '../auth';
import { getComments, getPlaylist, ObjectTypes } from '../objects';
import { TrackActionTypes } from './types';
import { addToast } from '../ui';
import { Intent } from '@blueprintjs/core';

export function toggleLike(trackId: number, playlist = false): ThunkResult<any> {
    return (dispatch, getState) => {
        const { auth: { likes, me } } = getState();

        if (!me) return;

        const liked = !SC.hasID(trackId, (playlist ? likes.playlist : likes.track));

        dispatch<Promise<any>>({
            type: AuthActionTypes.SET_LIKE,
            payload: fetchToJson(playlist ? SC.updatePlaylistLikeUrl(me.id, trackId) : SC.updateLikeUrl(trackId), {
                method: (liked) ? 'PUT' : 'DELETE'
            }).then(() => {
                
                if (liked) {
                    dispatch(addToast({
                        message: `Liked track`,
                        intent: Intent.SUCCESS
                    }))
                }

                return {
                    trackId,
                    liked,
                    playlist
                };
            })
        } as any)
            .then(() => IPC.notifyTrackLiked())
            .catch((err) => {
                if (err.response && err.response.status === 429) {
                    return err.response.json()
                        .then((res: any) => {
                            if (res && res.errors) {
                                const error = res.errors[0];

                                if (error && error.reason_phrase === 'info: too many likes') {
                                    toastr.error('Unable to like track', `You have liked too quick, you can like again ${moment(error.release_at).fromNow()}`);
                                }
                            }
                        });
                }
            });

    };
}

/**
 * Toggle repost of a specific track
 *
 * @param trackId
 * @param playlist
 * @returns {function(*, *)}
 */

export function toggleRepost(trackId: number, playlist = false): ThunkResult<Promise<any>> {
    return (dispatch, getState) => {
        const { auth: { reposts } } = getState();

        if (playlist) {
            throw new Error('Not implemented');
        }

        const reposted = !((trackId in reposts) ? reposts[trackId] : 0);

        return dispatch<Promise<any>>({
            type: AuthActionTypes.SET_REPOST,
            payload: fetch(SC.updateRepostUrl(trackId), {
                method: (reposted) ? 'PUT' : 'DELETE'
            }).then(() => {

                if (reposted) {
                    dispatch(addToast({
                        message: `Reposted track`,
                        intent: Intent.SUCCESS
                    }))
                }

                return {
                    trackId,
                    reposted,
                    playlist
                };
            })
        } as any)
            .then(() => IPC.notifyTrackReposted());

    };
}

export function fetchTrackIfNeeded(trackId: number): ThunkResult<any> {
    return (dispatch, getState) => {
        const { entities: { trackEntities }, objects } = getState();
        const playlists = objects[ObjectTypes.PLAYLISTS] || {};
        const comments = objects[ObjectTypes.COMMENTS] || {};
        const current_playlist = String(trackId + RELATED_PLAYLIST_SUFFIX);

        const track = trackEntities[trackId];

        if (!track || (track && !track.playback_count && !track.loading)) {
            dispatch(getTrack(trackId));
        }

        if (!(current_playlist in playlists)) {
            dispatch(getPlaylist(SC.getRelatedUrl(trackId), trackId + RELATED_PLAYLIST_SUFFIX, { appendId: trackId }));
        }

        const comment = comments[trackId];

        if (!comment) {
            dispatch(getComments(trackId));
        }

    };
}

function getTrack(trackId: number) {
    return {
        type: TrackActionTypes.ADD,
        payload: {
            promise: fetchTrack(trackId)
                .then(({ normalized: { entities } }) => {

                    if (entities.trackEntities && entities.trackEntities[trackId]) {
                        entities.trackEntities[trackId].loading = false;
                    }

                    return {
                        entities
                    };
                })
                .catch(() => ({
                    entities: {
                        trackEntities: {
                            [trackId]: {
                                loading: false
                            }
                        }
                    }
                })),
            data: {
                entities: {
                    trackEntities: {
                        [trackId]: {
                            loading: true,
                            error: true
                        }
                    }
                }
            }
        }
    };
}

