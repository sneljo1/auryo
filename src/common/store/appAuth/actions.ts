import { TokenResponse } from '@main/aws/awsIotService';
import { createAction } from 'typesafe-actions';
import { AppAuthActionTypes } from './types';

export const refreshToken = createAction(AppAuthActionTypes.REFRESH_TOKEN)<TokenResponse>();
export const finishOnboarding = createAction(AppAuthActionTypes.FINISH_ONBOARDING)();
export const login = createAction(AppAuthActionTypes.LOGIN, (loading = true) => loading)();
export const logout = createAction(AppAuthActionTypes.LOGOUT)();
export const loginSuccess = createAction(
  AppAuthActionTypes.LOGIN_SUCCESS,
  (tokenResponse?: TokenResponse) => tokenResponse
)();

export const loginError = createAction(AppAuthActionTypes.LOGIN_ERROR, (error?: string) => error)();
export const loginTerminated = createAction(AppAuthActionTypes.LOGIN_TERMINATED)();
