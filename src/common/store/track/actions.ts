import { wError, wSuccess } from '@common/utils/reduxUtils';
import { EntitiesOf, EpicFailure, SoundCloud } from '@types';
import { createAction, createAsyncAction } from 'typesafe-actions';
import { ObjectItem, TrackActionTypes } from '../types';

export const getTrack = createAsyncAction(
  String(TrackActionTypes.GET_TRACK),
  wSuccess(TrackActionTypes.GET_TRACK),
  wError(TrackActionTypes.GET_TRACK)
)<
  { refresh: boolean; trackId: number },
  { trackId: number; entities: EntitiesOf<SoundCloud.Track> },
  EpicFailure & { trackId: number }
>();

export const getComments = createAsyncAction(
  String(TrackActionTypes.GET_COMMENTS),
  wSuccess(TrackActionTypes.GET_COMMENTS),
  wError(TrackActionTypes.GET_COMMENTS)
)<{ refresh: boolean; trackId: number }, ObjectItem & { trackId: number }, EpicFailure & { trackId: number }>();

export const commentsFetchMore = createAsyncAction(
  String(TrackActionTypes.GET_COMMENTS_FETCH_MORE),
  wSuccess(TrackActionTypes.GET_COMMENTS_FETCH_MORE),
  wError(TrackActionTypes.GET_COMMENTS_FETCH_MORE)
)<{ trackId: number }, ObjectItem & { trackId: number }, EpicFailure & { trackId: number }>();

export const setCommentsLoading = createAction(TrackActionTypes.SET_COMMENTS_LOADING)<{ trackId: number }>();
