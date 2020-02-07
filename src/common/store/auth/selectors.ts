import { createSelector } from 'reselect';
import { AuthFollowing, AuthLikes, AuthState } from '.';
import { StoreState } from '..';
import { Normalized } from '@types';
import { SC } from '../../utils';
import { EntitiesState } from '../entities';
import { getEntities } from '../entities/selectors';
import { ObjectGroup, ObjectState } from '../objects';
import { getPlaylistsObjects } from '../objects/selectors';
import { AuthReposts } from './types';

export const getAuth = (state: StoreState) => state.auth;

export const getFollowings = createSelector<StoreState, AuthState, AuthFollowing>(
  getAuth,
  auth => auth.followings || {}
);

export const getLikes = createSelector<StoreState, AuthState, AuthLikes>(getAuth, auth => auth.likes || {});
export const getReposts = createSelector<StoreState, AuthState, AuthReposts>(getAuth, auth => auth.reposts || {});

export const getUserPlaylists = createSelector<StoreState, AuthState, Normalized.NormalizedResult[]>(
  getAuth,
  auth => auth.playlists || []
);

export type CombinedUserPlaylistState = { title: string; id: number } & ObjectState<Normalized.NormalizedResult>;

export const getUserPlaylistsCombined = createSelector<
  StoreState,
  Normalized.NormalizedResult[],
  ObjectGroup,
  EntitiesState,
  CombinedUserPlaylistState[]
>(getUserPlaylists, getPlaylistsObjects, getEntities, (playlists, objects, entities) =>
  playlists.map(p => ({
    ...objects[p.id],
    id: p.id,
    title: (entities.playlistEntities[p.id] || {}).title || ''
  }))
);

export const isFollowing = (userId: number) =>
  createSelector(getFollowings, followings => SC.hasID(userId, followings));
export const hasLiked = (trackId: number, type: 'playlist' | 'track' = 'track') =>
  createSelector(getLikes, likes => SC.hasID(trackId, likes[type]));
