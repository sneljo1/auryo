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
    const { userId } = action.payload;

    const errors = state.userProfilesError;

    delete errors[userId];

    return {
      ...state,
      userProfilesLoading: Array.from(new Set([...state.userProfilesLoading, userId])),
      userProfilesError: {
        ...errors
      }
    };
  })
  .handleAction(getUserProfiles.success, (state, action) => {
    const { userId } = action.payload;

    const errors = state.userProfilesError;

    delete errors[userId];

    return {
      ...state,
      userProfilesLoading: state.userProfilesLoading.filter(id => id !== userId),
      userProfilesError: {
        ...errors
      }
    };
  })
  .handleAction(getUserProfiles.failure, (state, action) => {
    const { userId, error } = action.payload;

    return {
      ...state,
      userProfilesLoading: state.userProfilesLoading.filter(id => id !== userId),
      userProfilesError: {
        ...state.error,
        [userId]: error
      }
    };
  })
  .handleAction(resetStore, () => {
    return initialState;
  });
