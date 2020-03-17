import { ObjectMap } from '@types';
import { RootState } from 'AppReduxTypes';
import { createSelector } from 'reselect';
import { AuthFollowing, AuthLikes, AuthState } from '.';
import { SC } from '../../utils';
import { EntitiesState } from '../entities';
import { getEntities } from '../entities/selectors';
import { ObjectGroup, ObjectState } from '../objects';
import { getPlaylistsObjects } from '../objects/selectors';
import { StoreState } from '../rootReducer';
import { AuthPlaylists, AuthReposts } from './types';

export const getAuth = (state: RootState) => state.auth;

export const isCurrentUserLoading = createSelector(getAuth, auth => auth.me.isLoading);
export const currentUserSelector = createSelector(getAuth, auth => auth.me.data);
export const currentUserErrorSelector = createSelector(getAuth, auth => auth.me.error);

export const getFollowings = createSelector(getAuth, auth => auth.followings || {});

export const getAuthLikesSelector = createSelector(getAuth, auth => auth.likes || {});
export const getAuthPersonalizedPlaylistsSelector = createSelector(getAuth, auth => auth.personalizedPlaylists || {});
export const getAuthPlaylistLikesSelector = createSelector(getAuthLikesSelector, auth => auth.playlist);
export const getAuthRepostsSelector = createSelector(getAuth, auth => auth.reposts || {});

export const getAuthPlaylistsSelector = createSelector(getAuth, auth => auth.playlists.data);

export type CombinedUserPlaylistState = { title: string; id: number } & ObjectState;

export const getUserPlaylistsCombined = createSelector<
  StoreState,
  AuthPlaylists,
  ObjectGroup,
  EntitiesState,
  CombinedUserPlaylistState[]
>(getAuthPlaylistsSelector, getPlaylistsObjects, getEntities, (playlists, objects, entities) =>
  playlists.owned.map(p => ({
    ...objects[p.id],
    id: p.id,
    title: (entities.playlistEntities[p.id] || {}).title || ''
  }))
);

export const isFollowing = (userId: number) =>
  createSelector(getFollowings, followings => SC.hasID(userId, followings));
export const hasLiked = (trackId: number | string, type: 'playlist' | 'track' | 'systemPlaylist' = 'track') =>
  createSelector(getAuthLikesSelector, likes => SC.hasID(trackId, likes[type]));
export const hasReposted = (trackId: number | string, type: 'playlist' | 'track' = 'track') =>
  createSelector(getAuthRepostsSelector, reposts => SC.hasID(trackId, reposts[type]));
