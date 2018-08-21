import { SC } from "../utils";
import { getPlaylist } from "./objectActions";
import { actionTypes, OBJECT_TYPES, USER_TRACKS_PLAYLIST_SUFFIX, USER_LIKES_SUFFIX } from "../constants";
import fetchToJson from "../api/helpers/fetchToJson";

/**
 * Fetch auth if limited info is available. Also check if auth tracks or likes have been fetched.
 *
 * @param userId
 * @returns {function(*, *)}
 */
export function fetchArtistIfNeeded(userId) {
    return (dispatch, getState) => {
        const { entities, objects } = getState();
        const { user_entities } = entities;
        const playlistObjects = objects[OBJECT_TYPES.PLAYLISTS];

        const user = user_entities[userId]

        if (!user || (user && !user.followers_count && !user.loading)) {
            dispatch(getUser(userId));
        }

        if (!user || (user && !user.profiles && !user.profiles_loading)) {
            dispatch(getUserProfiles(userId));
        }

        const tracksPlaylistId = userId + USER_TRACKS_PLAYLIST_SUFFIX;
        const tracksPlaylist = playlistObjects[tracksPlaylistId]

        if (!tracksPlaylist) {
            dispatch(getPlaylist(SC.getUserTracksUrl(userId), tracksPlaylistId));
        }

        const likesPlaylistId = userId + USER_LIKES_SUFFIX;
        const likesPlaylist = playlistObjects[tracksPlaylistId]

        if (!likesPlaylist) {
            dispatch(getPlaylist(SC.getUserLikesUrl(userId), likesPlaylistId));
        }
    }
}

/**
 * Get and save user
 *
 * @param userId
 * @returns {{type, payload: Promise}}
 */
function getUser(userId) {
    return {
        type: actionTypes.USER_SET,
        payload: {
            promise: fetchToJson(SC.getUserUrl(userId))
                .then(user => ({
                    entities: {
                        user_entities: {
                            [user.id]: {
                                ...user,
                                loading: false
                            }
                        }
                    }
                })),
            data: {
                entities: {
                    user_entities: {
                        [userId]: {
                            loading: true
                        }
                    }
                }
            }
        }
    }
}

/**
 * get & save user profiles
 *
 * @param userId
 * @returns {{type, payload: Promise}}
 */
function getUserProfiles(userId) {
    return {
        type: actionTypes.USER_SET_PROFILES,
        payload: {
            promise: fetchToJson(SC.getUserWebProfilesUrl(userId))
                .then(profiles => ({
                    entities: {
                        user_entities: {
                            [userId]: {
                                profiles,
                                profiles_loading: false
                            }
                        }
                    }
                })),
            data: {
                entities: {
                    user_entities: {
                        [userId]: {
                            profiles_loading: true
                        }
                    }
                }
            }
        }
    }
}