import { createReducer } from 'typesafe-actions';
import { resetStore } from '../actions';
import { UserState } from '../types';
import { getUser, getUserProfiles } from './actions';

const initialState: UserState = {
  loading: [],
  error: {},
  userProfilesLoading: [],
  userProfilesError: {}
};

export const userReducer = createReducer<UserState>(initialState)
  .handleAction(getUser.request, (state, action) => {
    const { userId } = action.payload;

    const errors = state.error;

    delete errors[userId];

    return {
      ...state,
      loading: Array.from(new Set([...state.loading, userId])),
      error: {
        ...errors
      }
    };
  })
  .handleAction(getUser.success, (state, action) => {
    const { userId } = action.payload;

    const errors = state.error;

    delete errors[userId];

    return {
      ...state,
      loading: state.loading.filter(id => id !== userId),
      error: {
        ...errors
      }
    };
  })
  .handleAction(getUser.failure, (state, action) => {
    const { userId, error } = action.payload;

    return {
      ...state,
      loading: state.loading.filter(id => id !== userId),
      error: {
        ...state.error,
        [userId]: error
      }
    };
  })
  .handleAction(getUserProfiles.request, (state, action) => {
    const { userUrn } = action.payload;

    const errors = state.userProfilesError;

    delete errors[userUrn];

    return {
      ...state,
      userProfilesLoading: Array.from(new Set([...state.userProfilesLoading, userUrn])),
      userProfilesError: {
        ...errors
      }
    };
  })
  .handleAction(getUserProfiles.success, (state, action) => {
    const { userUrn } = action.payload;

    const errors = state.userProfilesError;

    delete errors[userUrn];

    return {
      ...state,
      userProfilesLoading: state.userProfilesLoading.filter(id => id !== userUrn),
      userProfilesError: {
        ...errors
      }
    };
  })
  .handleAction(getUserProfiles.failure, (state, action) => {
    const { userUrn, error } = action.payload;

    return {
      ...state,
      userProfilesLoading: state.userProfilesLoading.filter(id => id !== userUrn),
      userProfilesError: {
        ...state.error,
        [userUrn]: error
      }
    };
  })
  .handleAction(resetStore, () => {
    return initialState;
  });
