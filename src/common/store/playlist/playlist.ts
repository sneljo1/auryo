import { NormalizedResult, ThunkResult } from '../../../types';
import fetchToJson from '../../api/helpers/fetchToJson';
import { SC } from '../../utils';
import { ObjectsActionTypes, ObjectTypes } from '../objects';
import { addToast } from '../ui';
import { Intent } from '@blueprintjs/core';


/**
 * Add track to certain playlist
 *
 * @param trackId
 * @param playlistId
 * @returns {function(*, *)}
 */
export function togglePlaylistTrack(trackId: number, playlistId: number): ThunkResult<any> {
    return (dispatch, getState) => {
        const {
            objects,
            entities: {
                playlistEntities }
        } = getState();

        const playlist_objects = objects[ObjectTypes.PLAYLISTS];
        const playlist_object = playlist_objects[playlistId];
        const playlist_entitity = playlistEntities[playlistId];

        let newitems: Array<NormalizedResult> = [];

        const track: NormalizedResult = { id: trackId, schema: 'tracks' };

        const found: boolean = !!playlist_object.items.find((t) => t.id === track.id && t.schema === track.schema);

        let add = true;

        if (!found) {
            newitems = [track, ...playlist_object.items];
        } else {
            newitems = [...playlist_object.items.filter((normalizedResult) => normalizedResult.id !== track.id)];
            add = false;
        }

        dispatch({
            type: ObjectsActionTypes.UPDATE_ITEMS,
            payload: {
                promise: fetchToJson(SC.getPlaylistupdateUrl(playlistId), {
                    method: 'PUT',
                    body: JSON.stringify({
                        playlist: {
                            tracks: newitems.map((i) => i.id)
                        }
                    })
                })
                    .then(() => {

                        const {
                            entities: {
                                trackEntities
                            }
                        } = getState();

                        const track = trackEntities[trackId];

                        dispatch(addToast({
                            message: `Track ${add ? 'added to' : 'removed from'} playlist`,
                            intent: Intent.SUCCESS
                        }));

                        return {
                            objectId: playlistId,
                            objectType: ObjectTypes.PLAYLISTS,
                            items: newitems,
                            entities: {
                                playlistEntities: {
                                    [playlistId]: {
                                        track_count: !found ? playlist_entitity.track_count + 1 : playlist_entitity.track_count - 1,
                                        duration: !found ? playlist_entitity.duration + track.duration : playlist_entitity.duration - track.duration
                                    }
                                }
                            }
                        };
                    }),
                data: {
                    objectId: playlistId,
                    objectType: ObjectTypes.PLAYLISTS
                }
            }
        });


    };
}

// This method is unused
export function createPlaylist(title: string, type: string, tracks: Array<NormalizedResult>) {
    return () => fetchToJson(SC.getPlaylistUrl(), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            playlist: {
                title,
                sharing: type,
                tracks: tracks.map((i) => i.id)
            }
        })
    });

}

// This method is unused because a playlist only gets deleted after a while,
// not sure if we can check if it's pending deletion. Otherwise it would be bad UX
export function deletePlaylist(playlistId: string): ThunkResult<any> {
    return (dispatch, getState) => {
        const {
            entities: {
                playlistEntities
            }
        } = getState();

        const playlist_entitity = playlistEntities[playlistId];

        if (playlist_entitity) {

            fetchToJson(SC.getPlaylistDeleteUrl(playlistId), {
                method: 'DELETE'
            })
                .then(() => {
                    dispatch(addToast({
                        message: `Playlist has been deleted`,
                        intent: Intent.SUCCESS
                    }));
                })
                .catch(() => {
                    dispatch(addToast({
                        message: `Unable to delete playlist`,
                        intent: Intent.DANGER
                    }));
                });
        }
    };
}
