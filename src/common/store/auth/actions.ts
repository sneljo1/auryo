import { AuthActionTypes, AuthLikes, AuthPlaylists, AuthReposts, LikeType, RepostType } from '@common/store/auth/types';
import { wError, wSuccess } from '@common/utils/reduxUtils';
import { EntitiesOf, EpicFailure, ObjectMap, SoundCloud } from '@types';
import { createAsyncAction } from 'typesafe-actions';
import { FetchedPlaylistItem } from './api';

export const getCurrentUser = createAsyncAction(
  String(AuthActionTypes.GET_USER),
  wSuccess(AuthActionTypes.GET_USER),
  wError(AuthActionTypes.GET_USER)
)<unknown, SoundCloud.User, EpicFailure>();

export const getCurrentUserFollowingsIds = createAsyncAction(
  String(AuthActionTypes.GET_USER_FOLLOWINGS_IDS),
  wSuccess(AuthActionTypes.GET_USER_FOLLOWINGS_IDS),
  wError(AuthActionTypes.GET_USER_FOLLOWINGS_IDS)
)<undefined, ObjectMap, EpicFailure>();

export const getCurrentUserLikeIds = createAsyncAction(
  String(AuthActionTypes.GET_USER_LIKE_IDS),
  wSuccess(AuthActionTypes.GET_USER_LIKE_IDS),
  wError(AuthActionTypes.GET_USER_LIKE_IDS)
)<undefined, AuthLikes, EpicFailure>();

export const getCurrentUserRepostIds = createAsyncAction(
  String(AuthActionTypes.GET_USER_REPOST_IDS),
  wSuccess(AuthActionTypes.GET_USER_REPOST_IDS),
  wError(AuthActionTypes.GET_USER_REPOST_IDS)
)<undefined, AuthReposts, EpicFailure>();

export const getCurrentUserPlaylists = createAsyncAction(
  String(AuthActionTypes.GET_USER_PLAYLISTS),
  wSuccess(AuthActionTypes.GET_USER_PLAYLISTS),
  wError(AuthActionTypes.GET_USER_PLAYLISTS)
)<unknown, AuthPlaylists & { entities: EntitiesOf<FetchedPlaylistItem> }, EpicFailure>();

export interface ToggleLikeRequestPayload {
  id: number | string;
  type: LikeType;
}

export const toggleLike = createAsyncAction(
  String(AuthActionTypes.TOGGLE_LIKE),
  wSuccess(AuthActionTypes.TOGGLE_LIKE),
  wError(AuthActionTypes.TOGGLE_LIKE)
)<
  {} | ToggleLikeRequestPayload,
  { id: number | string; type: LikeType; liked: boolean },
  EpicFailure & { id: number | string; type: LikeType; liked: boolean }
>();

export interface ToggleRepostRequestPayload {
  id: number | string;
  type: RepostType;
}

export const toggleRepost = createAsyncAction(
  String(AuthActionTypes.TOGGLE_REPOST),
  wSuccess(AuthActionTypes.TOGGLE_REPOST),
  wError(AuthActionTypes.TOGGLE_REPOST)
)<
  {} | ToggleRepostRequestPayload,
  { id: number | string; type: RepostType; reposted: boolean },
  EpicFailure & { id: number | string; type: RepostType; reposted: boolean }
>();

export const toggleFollowing = createAsyncAction(
  String(AuthActionTypes.TOGGLE_FOLLOWING),
  wSuccess(AuthActionTypes.TOGGLE_FOLLOWING),
  wError(AuthActionTypes.TOGGLE_FOLLOWING)
)<
  { userId: number | string },
  { userId: number | string; follow: boolean },
  EpicFailure & { userId: number | string; follow: boolean }
>();
