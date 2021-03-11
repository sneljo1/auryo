import { StoreState } from 'AppReduxTypes';
import { createSelector } from 'reselect';

export const getUser = (state: StoreState) => state.user;

export const isUserLoading = (userId: string) => createSelector([getUser], (user) => user.loading.includes(+userId));
export const isUserError = (userId: number | string) => createSelector([getUser], (user) => user.error[userId]);

export const isUserProfilesLoading = (userId: string) =>
  createSelector([getUser], (user) => user.userProfilesLoading.includes(userId));
export const isUserProfilesError = (userId: number | string) =>
  createSelector([getUser], (user) => user.userProfilesError[userId]);
