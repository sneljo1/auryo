import { AxiosError } from 'axios';

// TYPES
export interface UserState {
  loading: number[];
  error: { [userId: string]: AxiosError | Error | null };

  userProfilesLoading: string[];
  userProfilesError: { [userId: string]: AxiosError | Error | null };
}
// ACTIONS

export enum UserActionTypes {
  GET_USER = '@@user/GET_USER',
  GET_USER_PROFILES = '@@user/GET_USER_PROFILES',

  SET_PROFILES = '@@user/SET_PROFILES',
  SET = '@@user/SET'
}
