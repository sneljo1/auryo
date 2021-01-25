import { wError, wSuccess } from '@common/utils/reduxUtils';
import { EntitiesOf, EpicFailure, SoundCloud } from '@types';
import { createAsyncAction } from 'typesafe-actions';
import { UserActionTypes } from '../types';

export const getUser = createAsyncAction(
  String(UserActionTypes.GET_USER),
  wSuccess(UserActionTypes.GET_USER),
  wError(UserActionTypes.GET_USER)
)<
  { refresh: boolean; userId: number },
  { userId: number; entities: EntitiesOf<SoundCloud.User> },
  EpicFailure & { userId: number }
>();

export const getUserProfiles = createAsyncAction(
  String(UserActionTypes.GET_USER_PROFILES),
  wSuccess(UserActionTypes.GET_USER_PROFILES),
  wError(UserActionTypes.GET_USER_PROFILES)
)<
  { userId: string },
  { userId: string; entities: EntitiesOf<SoundCloud.UserProfiles> },
  EpicFailure & { userId: string }
>();
