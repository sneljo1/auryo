// TYPES
export interface UserState {
  loading: number[];
  error: { [userId: string]: Error | null | undefined };

  userProfilesLoading: string[];
  userProfilesError: { [userId: string]: Error | null | undefined };
}
// ACTIONS

export enum UserActionTypes {
  GET_USER = 'auryo.user.GET_USER',
  GET_USER_PROFILES = 'auryo.user.GET_USER_PROFILES',

  SET_PROFILES = 'auryo.user.SET_PROFILES',
  SET = 'auryo.user.SET'
}
