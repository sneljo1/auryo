// TYPES
export type AppAuthState = Readonly<{
  isLoading: boolean;
  isError: boolean;
  error?: null | string;
  sessionUUID?: null | string;
  codeVerifier?: null | string;
}>;

export interface TokenResponse {
  access_token: string;
  expires_at?: number;
  refresh_token?: string;
}

// ACTIONS
export enum AppAuthActionTypes {
  LOGIN = 'auryo.auth.LOGIN',
  START_LOGIN_SESSION = 'auryo.auth.START_LOGIN_SESSION',
  VERIFY_LOGIN_SESSION = 'auryo.auth.VERIFY_LOGIN_SESSION',
  LOGIN_SUCCESS = 'auryo.appAuth.LOGIN_SUCCESS',
  LOGIN_ERROR = 'auryo.appAuth.LOGIN_ERROR',
  LOGIN_TERMINATED = 'auryo.appAuth.LOGIN_TERMINATED',
  LOGOUT = 'auryo.appAuth.LOGOUT',
  INITIATE_TOKEN_REFRESH = 'auryo.appAuth.INITIATE_TOKEN_REFRESH',
  TOKEN_REFRESH = 'auryo.appAuth.TOKEN_REFRESH',
  FINISH_ONBOARDING = 'auryo.appAuth.FINISH_ONBOARDING'
}
