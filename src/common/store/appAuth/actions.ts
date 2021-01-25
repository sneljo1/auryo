import { wCancel, wError, wSuccess } from '@common/utils/reduxUtils';
import { createAction, createAsyncAction } from 'typesafe-actions';
import { AppAuthActionTypes, TokenResponse } from '../types';

export const tokenRefresh = createAsyncAction(
  String(AppAuthActionTypes.TOKEN_REFRESH),
  wSuccess(AppAuthActionTypes.TOKEN_REFRESH),
  wError(AppAuthActionTypes.TOKEN_REFRESH)
)<object, TokenResponse, object>();

export const login = createAsyncAction(
  String(AppAuthActionTypes.LOGIN),
  wSuccess(AppAuthActionTypes.LOGIN),
  wError(AppAuthActionTypes.LOGIN),
  wCancel(AppAuthActionTypes.LOGIN)
)<object, TokenResponse | unknown, { message?: string }, object>();

export const finishOnboarding = createAction(AppAuthActionTypes.FINISH_ONBOARDING)();
export const startLoginSession = createAction(AppAuthActionTypes.START_LOGIN_SESSION)<{
  uuid: string;
  codeVerifier: string;
}>();
export const verifyLoginSession = createAction(AppAuthActionTypes.VERIFY_LOGIN_SESSION)();
export const logout = createAction(AppAuthActionTypes.LOGOUT)();
