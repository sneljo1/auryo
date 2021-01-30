import { StoreState } from 'AppReduxTypes';
import { createSelector } from 'reselect';
import { SC } from '../../utils';
import { ObjectState } from '../types';
import { getPlaylistsObjects } from '../objects/selectors';
import { getEntities } from '../entities/selectors';

export const getAuth = (state: StoreState) => state.auth;

export const isCurrentUserLoading = createSelector(getAuth, (auth) => auth.me.isLoading);
export const currentUserSelector = createSelector(getAuth, (auth) => auth.me.data);
export const currentUserErrorSelector = createSelector(getAuth, (auth) => auth.me.error);

export const getFollowings = createSelector(getAuth, (auth) => auth.followings || {});

export const getAuthLikesSelector = createSelector(getAuth, (auth) => auth.likes || {});
export const getAuthPersonalizedPlaylistsSelector = createSelector(getAuth, (auth) => auth.personalizedPlaylists || {});
export const getAuthPlaylistLikesSelector = createSelector(getAuthLikesSelector, (auth) => auth.playlist);
export const getAuthRepostsSelector = createSelector(getAuth, (auth) => auth.reposts || {});

export const getAuthPlaylistsSelector = createSelector(getAuth, (auth) => auth.playlists.data);
export const getOwnedAuthPlaylistsSelector = createSelector(
  getAuthPlaylistsSelector,
  (authPlaylists) => authPlaylists.owned
);

export type CombinedUserPlaylistState = { title: string; id: number } & ObjectState;

export const getUserPlaylistsCombined = createSelector(
  getAuthPlaylistsSelector,
  getPlaylistsObjects,
  getEntities,
  (playlists, objects, entities) =>
    playlists.owned.map((p) => ({
      ...objects[p.id],
      id: p.id,
      title: (entities.playlistEntities[p.id] || {}).title || ''
    }))
);

export const isFollowing = (userId: number | string) =>
  createSelector(getFollowings, (followings) => SC.hasID(userId, followings));
export const hasLiked = (trackId: number | string, type: 'playlist' | 'track' | 'systemPlaylist' = 'track') =>
  createSelector(getAuthLikesSelector, (likes) => SC.hasID(trackId, likes[type]));
export const hasReposted = (trackId: number | string, type: 'playlist' | 'track' = 'track') =>
  createSelector(getAuthRepostsSelector, (reposts) => SC.hasID(trackId, reposts[type]));
