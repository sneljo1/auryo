import {SC} from "../utils";
import {getPlaylist} from "./objectActions";
import {actionTypes, OBJECT_TYPES, USER_TRACKS_PLAYLIST_SUFFIX, USER_LIKES_SUFFIX} from "../constants";
import fetchToJson from "../api/helpers/fetchToJson";

/**
 * Fetch auth if limited info is available. Also check if auth tracks or likes have been fetched.
 *
 * @param user_id
 * @returns {function(*, *)}
 */
export function fetchArtistIfNeeded(user_id) {
    return (dispatch, getState) => {
        const {entities, objects} = getState();
        const {user_entities} = entities;
        const playlists = objects[OBJECT_TYPES.PLAYLISTS];


        if (!(user_id in user_entities) || !user_entities[user_id].followers_count) {
            dispatch(getUser(user_id));
        }

        if (!(user_id in user_entities) || !user_entities[user_id].profiles) {
            dispatch(getUserProfiles(user_id));
        }

        const tracks_playlist = user_id + USER_TRACKS_PLAYLIST_SUFFIX;

        if (playlists && !playlists[tracks_playlist]) {
            dispatch(getPlaylist(SC.getUserTracksUrl(user_id), tracks_playlist));
        }

        const likes_playlist = user_id + USER_LIKES_SUFFIX;

        if (playlists && !playlists[likes_playlist]) {
            dispatch(getPlaylist(SC.getUserLikesUrl(user_id), likes_playlist));
        }
    }
}

/**
 * Get and save user
 *
 * @param user_id
 * @returns {{type, payload: Promise}}
 */
function getUser(user_id) {
    return {
        type: actionTypes.USER_SET,
        payload: fetchToJson(SC.getUserUrl(user_id))
            .then(user => {
                return {
                    entities: {
                        user_entities: {
                            [user.id]: user
                        }
                    }
                }
            })
    }
}

/**
 * get & save user profiles
 *
 * @param user_id
 * @returns {{type, payload: Promise}}
 */
function getUserProfiles(user_id) {
    return {
        type: actionTypes.USER_SET_PROFILES,
        payload: fetchToJson(SC.getUserWebProfilesUrl(user_id))
            .then(json => {
                return {
                    entities: {
                        user_entities: {
                            [user_id]: {
                                profiles: json
                            }
                        }
                    }
                }
            })
    }
}