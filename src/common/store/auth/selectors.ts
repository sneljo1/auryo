import { createSelector } from 'reselect';
import { StoreState } from '..';
import { AuthState, AuthFollowing } from '.';
import { SC } from '../../utils';

// SC.hasID(item.id, followings);

export const getAuth = (state: StoreState) => state.auth;

export const getFollowings = createSelector<StoreState, AuthState, AuthFollowing>(
    getAuth,
    (auth) => auth.followings || {}
);

export const isFollowing = (userId: number) => createSelector(
    getFollowings,
    (followings) => SC.hasID(userId, followings)
);
