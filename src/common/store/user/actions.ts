import { SoundCloud } from '@types';
import fetchToJson from '../../api/helpers/fetchToJson';
import { SC } from '../../utils';
import { PlaylistTypes } from '../objects';
import { getPlaylist } from '../objects/actions';
import { getArtistLikesPlaylistObject, getArtistTracksPlaylistObject, getPlaylistName } from '../objects/selectors';
import { UserActionTypes } from './types';
import { ThunkResult } from '..';

/**
 * Get and save user
 */
function getUser(userId: number) {
  return {
    type: UserActionTypes.SET,
    payload: {
      promise: fetchToJson<SoundCloud.User>(SC.getUserUrl(userId))
        .then(user => ({
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
        .then(profiles => ({
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

export function fetchArtistIfNeeded(userId: number): ThunkResult<any> {
  return (dispatch, getState) => {
    const state = getState();
    const { entities } = state;
    const { userEntities } = entities;

    const user = userEntities[userId];

    if (!user || (user && !user.followers_count && !user.loading)) {
      dispatch(getUser(userId));
    }

    if (!user || (user && !user.profiles)) {
      dispatch(getUserProfiles(userId));
    }

    if (!getArtistTracksPlaylistObject(userId.toString())(state)) {
      dispatch(
        getPlaylist(SC.getUserTracksUrl(userId), getPlaylistName(userId.toString(), PlaylistTypes.ARTIST_TRACKS))
      );
    }

    if (!getArtistLikesPlaylistObject(userId.toString())(state)) {
      dispatch(getPlaylist(SC.getUserLikesUrl(userId), getPlaylistName(userId.toString(), PlaylistTypes.ARTIST_LIKES)));
    }
  };
}
