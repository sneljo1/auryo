import { StoreState } from 'AppReduxTypes';
import { createSelector } from 'reselect';

export const getUser = (state: StoreState) => state.user;

export const isUserLoading = (userId: string) => createSelector([getUser], user => user.loading.includes(+userId));
export const isUserError = (userId: number | string) => createSelector([getUser], user => user.error[userId]);

export const isUserProfilesLoading = (userUrn: string) =>
  createSelector([getUser], user => user.userProfilesLoading.includes(userUrn));
export const isUserProfilesError = (userUrn: number | string) =>
  createSelector([getUser], user => user.userProfilesError[userUrn]);
