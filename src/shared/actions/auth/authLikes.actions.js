import { actionTypes, OBJECT_TYPES, PLAYLISTS } from "../../constants";
import { SC } from "../../utils";
import fetchToObject from "../../api/helpers/fetchToObject";
import { getPlaylist } from "../objectActions";

/**
 * Get auth like ids
 *
 * @returns {function(*)}
 */

export function getAuthLikeIds() {
    return dispatch => Promise.all([
        dispatch({
            type: actionTypes.AUTH_SET_LIKES,
            payload: fetchToObject(SC.getLikeIdsUrl())
        }),
        dispatch({
            type: actionTypes.AUTH_SET_PLAYLIST_LIKES,
            payload: fetchToObject(SC.getPlaylistLikeIdsUrl())
        }),
    ])
}

/**
 * Get auth likes playlist if needed
 *
 * @returns {function(*, *)}
 */
export function getAuthLikesIfNeeded() {
    return (dispatch, getState) => {
        const { objects } = getState();

        const playlist_objects = objects[OBJECT_TYPES.PLAYLISTS];
        const playlist_object = playlist_objects[PLAYLISTS.LIKES];

        if (!playlist_object) {
            dispatch(getPlaylist(SC.getLikesUrl(), PLAYLISTS.LIKES));
        }
    }
}