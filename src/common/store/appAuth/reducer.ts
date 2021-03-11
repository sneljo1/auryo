import { createReducer } from 'typesafe-actions';
import { resetStore, startLoginSession } from '../actions';
import { login, verifyLoginSession } from './actions';
import { AppAuthState } from './types';

const initialState: AppAuthState = {
  isLoading: false,
  isError: false,
  error: null,
  sessionUUID: null,
  codeVerifier: null
};

export const appAuthReducer = createReducer<AppAuthState>(initialState)
  .handleAction(login.request, () => {
    return {
      isLoading: false,
      isError: false,
      error: null
    };
  })
  .handleAction(startLoginSession, (state, { payload }) => {
    return {
      ...state,
      sessionUUID: payload.uuid,
      codeVerifier: payload.codeVerifier
    };
  })
  .handleAction(verifyLoginSession, (state) => {
    return {
      ...state,
      isLoading: true
    };
  })
  .handleAction([login.success, login.cancel], (state) => {
    return {
      ...state,
      isLoading: false
    };
  })
  .handleAction(login.failure, (_, { payload }) => {
    return {
      isLoading: false,
      isError: true,
      error: payload?.message
    };
  })
  .handleAction(resetStore, () => initialState);
