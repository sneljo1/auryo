import { Intent } from '@blueprintjs/core';
import { axiosClient } from '@common/api/helpers/axiosClient';
// eslint-disable-next-line import/no-cycle
import { ThunkResult } from '@types';
import moment from 'moment';
// eslint-disable-next-line import/no-cycle
import fetchTrack from '../../api/fetchTrack';
import fetchToJson from '../../api/helpers/fetchToJson';
import { IPC } from '../../utils/ipc';
import * as SC from '../../utils/soundcloudUtils';
import { currentUserSelector } from '../auth/selectors';
import { AuthActionTypes } from '../auth/types';
// eslint-disable-next-line import/no-cycle
import { getTrackEntity } from '../entities/selectors';
// eslint-disable-next-line import/no-cycle
import { getComments, getPlaylistO } from '../objects/actions';
// eslint-disable-next-line import/no-cycle
import { getCommentObject, getPlaylistName, getRelatedTracksPlaylistObject } from '../objects/selectors';
import { PlaylistTypes } from '../objects/types';
import { addToast } from '../ui/actions';
import { TrackActionTypes } from './types';

export function toggleLike(trackId: number | string, playlist = false): ThunkResult<any> {
  return (dispatch, getState) => {
    const state = getState();
    const {
      auth: { likes }
    } = state;

    const currentUser = currentUserSelector(state);

    if (!currentUser) {
      return;
    }

    const liked = !SC.hasID(trackId, playlist ? likes.playlist : likes.track);

    dispatch<Promise<any>>({
      type: AuthActionTypes.SET_LIKE,
      payload: fetchToJson(playlist ? SC.updatePlaylistLikeUrl(currentUser.id, trackId) : SC.updateLikeUrl(trackId), {
        method: liked ? 'PUT' : 'DELETE'
      }).then(() => {
        if (liked) {
          dispatch(
            addToast({
              message: `Liked ${playlist ? 'playlist' : 'track'}`,
              intent: Intent.SUCCESS
            })
          );
        }

        return {
          trackId,
          liked,
          playlist
        };
      })
    } as any)
      .then(() => IPC.notifyTrackLiked(trackId))
      .catch(err => {
        if (err.response && err.response.status === 429) {
          return err.response.json().then((res: any) => {
            if (res && res.errors) {
              const error = res.errors[0];

              if (error && error.reason_phrase === 'info: too many likes') {
                dispatch(
                  addToast({
                    message: `Please slow down your likes, you can like again ${moment(error.release_at).fromNow()}`,
                    intent: Intent.DANGER
                  })
                );
              }
            }
          });
        }

        return null;
      });
  };
}

/**
 * Toggle repost of a specific track
 */

export function toggleRepost(trackOrPlaylistId: number | string, playlist = false): ThunkResult<Promise<any>> {
  return async (dispatch, getState) => {
    const {
      auth: { reposts }
    } = getState();

    const reposted = !SC.hasID(trackOrPlaylistId, playlist ? reposts.playlist : reposts.track);

    await dispatch<Promise<any>>({
      type: AuthActionTypes.SET_REPOST,
      payload: axiosClient(SC.updateRepostUrl(trackOrPlaylistId, !!playlist), {
        method: reposted ? 'PUT' : 'DELETE'
      }).then(() => {
        if (reposted) {
          dispatch(
            addToast({
              message: `Reposted track`,
              intent: Intent.SUCCESS
            })
          );
        }

        return {
          trackId: trackOrPlaylistId,
          reposted,
          playlist
        };
      })
    } as any);

    IPC.notifyTrackReposted();
  };
}

function getTrack(trackId: number) {
  return {
    type: TrackActionTypes.ADD,
    payload: {
      promise: fetchTrack(trackId)
        .then(({ normalized: { entities } }) => {
          const updatedEntities = entities;

          if (updatedEntities && updatedEntities.trackEntities && updatedEntities.trackEntities[trackId]) {
            updatedEntities.trackEntities[trackId].loading = false;
          }

          return {
            entities: updatedEntities
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

export function fetchTrackIfNeeded(trackId: number): ThunkResult<any> {
  return (dispatch, getState) => {
    const state = getState();

    const relatedTracksPlaylistId = getPlaylistName(trackId.toString(), PlaylistTypes.RELATED);

    const track = getTrackEntity(trackId)(state);

    if (!track || (track && !track.playback_count && !track.loading)) {
      dispatch(getTrack(trackId));
    }

    if (!getRelatedTracksPlaylistObject(trackId.toString())(state)) {
      dispatch(getPlaylistO(SC.getRelatedUrl(trackId), relatedTracksPlaylistId, { appendId: trackId }));
    }

    if (!getCommentObject(trackId.toString())(state)) {
      dispatch(getComments(trackId));
    }
  };
}
