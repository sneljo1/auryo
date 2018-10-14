import { createSelector } from 'reselect';
import { StoreState } from '..';
import { AuthState, AuthFollowing } from '.';
import { SC } from '../../utils';
import { NormalizedResult } from '../../../types';

// SC.hasID(item.id, followings);

export const getAuth = (state: StoreState) => state.auth;

export const getFollowings = createSelector<StoreState, AuthState, AuthFollowing>(
    getAuth,
    (auth) => auth.followings || {}
);

export const getUserPlaylists = createSelector<StoreState, AuthState, Array<NormalizedResult>>(
    getAuth,
    (auth) => auth.playlists || []
);

export const isFollowing = (userId: number) => createSelector(
    getFollowings,
    (followings) => SC.hasID(userId, followings)
);
