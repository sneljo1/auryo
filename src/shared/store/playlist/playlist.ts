import { toastr } from 'react-redux-toastr';
import { NormalizedResult, ThunkResult } from '../../../types';
import fetchToJson from '../../api/helpers/fetchToJson';
import { SC } from '../../utils';
import { ObjectsActionTypes, ObjectTypes } from '../objects';


/**
 * Add track to certain playlist
 *
 * @param trackId
 * @param playlistId
 * @returns {function(*, *)}
 */
export function togglePlaylistTrack(trackId: string, playlistId: string): ThunkResult<any> {
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

        const item_index = playlist_object.items.indexOf(track);

        let add = true;

        if (item_index === -1) {
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

                        const notificiationId = `addtoplaylist-${trackId}-${Date.now()}`;

                        // TODO toaster somewhere else

                        // dispatch(toastrActions.add({
                        //     id: notificiationId, // If not provided we will add one.
                        //     type: 'info',
                        //     title: track.title,
                        //     options: {
                        //         timeOut: 3000,
                        //         icon: (
                        //             <ReactImageFallback src={SC.getImageUrl(track, IMAGE_SIZES.MEDIUM)} />
                        //         ),
                        //         showCloseButton: false,
                        //         component: (
                        //             <div>
                        //                 {`Track ${add ? 'added to' : 'removed from'} playlist `} <Link
                        //                     onClick={() => {
                        //                         dispatch(toastrActions.remove(notificiationId))
                        //                         dispatch(hide('addToPlaylist'))
                        //                     }}
                        //                     to={`/playlist/${playlist_entitity.id}`}>{playlist_entitity.title}</Link>
                        //             </div>
                        //         )
                        //     }
                        // }))


                        return {
                            objectId: playlistId,
                            objectType: ObjectTypes.PLAYLISTS,
                            items: newitems,
                            entities: {
                                playlistEntities: {
                                    [playlistId]: {
                                        track_count: item_index === -1 ? playlist_entitity.track_count + 1 : playlist_entitity.track_count - 1,
                                        duration: item_index === -1 ? playlist_entitity.duration + track.duration : playlist_entitity.duration - track.duration
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
    })
        .then((res) => {
            console.log(res);
        });

}

// This method is unused because a playlist only gets deleted after a while, not sure if we can check if it's pending deletion. Otherwise it would be bad UX
export function deletePlaylist(playlistId: string): ThunkResult<any> {
    return (_dispatch, getState) => {
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
                    toastr.info(playlist_entitity.title, 'Playlist has been deleted!');
                })
                .catch(() => {
                    toastr.error(playlist_entitity.title, 'Unable to delete playlist!');
                });
        }
    };
}
