import { createReducer } from 'typesafe-actions';
import { resetStore, login, loginError, loginSuccess, loginTerminated } from '../actions';
import { AppAuthState } from './types';

const initialState = {
  isLoading: false,
  error: null
};

export const appAuthReducer = createReducer<AppAuthState>(initialState)
  .handleAction(login, () => {
    return {
      isLoading: true,
      error: null
    };
  })
  .handleAction(loginSuccess, () => {
    return {
      isLoading: false,
      error: null
    };
  })
  .handleAction(loginError, () => {
    return {
      isLoading: false,
      error: null
    };
  })
  .handleAction(loginTerminated, () => {
    return {
      isLoading: false,
      error: null
    };
  })
  .handleAction(resetStore, () => initialState);
