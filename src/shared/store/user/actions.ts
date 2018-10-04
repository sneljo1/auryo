import { SoundCloud, ThunkResult } from '../../../types';
import fetchToJson from '../../api/helpers/fetchToJson';
import { USER_LIKES_SUFFIX, USER_TRACKS_PLAYLIST_SUFFIX } from '../../constants';
import { SC } from '../../utils';
import { ObjectTypes } from '../objects';
import { getPlaylist } from '../objects/actions';
import { UserActionTypes } from './types';


export function fetchArtistIfNeeded(userId: number): ThunkResult<any> {
    return (dispatch, getState) => {
        const { entities, objects } = getState();
        const { userEntities } = entities;
        const playlistObjects = objects[ObjectTypes.PLAYLISTS];

        const user = userEntities[userId];

        if (!user || (user && !user.followers_count && !user.loading)) {
            dispatch(getUser(userId));
        }

        if (!user || (user && !user.profiles)) {
            dispatch(getUserProfiles(userId));
        }

        const tracksPlaylistId = userId + USER_TRACKS_PLAYLIST_SUFFIX;
        const tracksPlaylist = playlistObjects[tracksPlaylistId];

        if (!tracksPlaylist) {
            dispatch(getPlaylist(SC.getUserTracksUrl(userId), tracksPlaylistId));
        }

        const likesPlaylistId = userId + USER_LIKES_SUFFIX;
        const likesPlaylist = playlistObjects[tracksPlaylistId];

        if (!likesPlaylist) {
            dispatch(getPlaylist(SC.getUserLikesUrl(userId), likesPlaylistId));
        }
    };
}

/**
 * Get and save user
 *
 * @param userId
 * @returns {{type, payload: Promise}}
 */
function getUser(userId: number) {
    return {
        type: UserActionTypes.SET,
        payload: {
            promise: fetchToJson(SC.getUserUrl(userId))
                .then((user: SoundCloud.User) => ({
                    entities: {
                        userEntities: {
                            [user.id]: {
                                ...user,
                                loading: false
                            }
                        }
                    }
                }))
                .catch(() => ({
                    entities: {
                        userEntities: {
                            [userId]: {
                                loading: false
                            }
                        }
                    }
                })),
            data: {
                entities: {
                    userEntities: {
                        [userId]: {
                            loading: true
                        }
                    }
                }
            }
        }
    };
}

function getUserProfiles(userId: number) {
    return {
        type: UserActionTypes.SET_PROFILES,
        payload: {
            promise: fetchToJson(SC.getUserWebProfilesUrl(userId))
                .then((profiles) => ({
                    entities: {
                        userEntities: {
                            [userId]: {
                                profiles: {
                                    loading: false,
                                    items: profiles
                                }
                            }
                        }
                    }
                }))
                .catch(() => ({
                    entities: {
                        userEntities: {
                            [userId]: {
                                profiles: {
                                    loading: false,
                                    items: []
                                }
                            }
                        }
                    }
                })),
            data: {
                entities: {
                    userEntities: {
                        [userId]: {
                            profiles: {
                                loading: true,
                                items: []
                            }
                        }
                    }
                }
            }
        }
    };
}
