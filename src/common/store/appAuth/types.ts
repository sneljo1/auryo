// TYPES
export type AppAuthState = Readonly<{
  isLoading: boolean;
  error?: null | string;
}>;

// ACTIONS
export enum AppAuthActionTypes {
  LOGIN = '@@auth/LOGIN',
  LOGIN_SUCCESS = '@@appAuth/LOGIN_SUCCESS',
  LOGIN_ERROR = '@@appAuth/LOGIN_ERROR',
  LOGIN_TERMINATED = '@@appAuth/LOGIN_TERMINATED',
  LOGOUT = '@@appAuth/LOGOUT',
  REFRESH_TOKEN = '@@appAuth/REFRESH_TOKEN',
  FINISH_ONBOARDING = '@@appAuth/FINISH_ONBOARDING'
}
