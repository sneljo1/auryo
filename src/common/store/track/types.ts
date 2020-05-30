import { AxiosError } from 'axios';

export interface TrackState {
  loading: number[];
  error: { [trackId: string]: AxiosError | Error | null };
}

// ACTIONS

export enum TrackActionTypes {
  ADD = '@@track/ADD',
  GET_TRACK = '@@track/GET_TRACK',
  GET_COMMENTS = '@@track/GET_COMMENTS',
  GET_COMMENTS_FETCH_MORE = '@@track/GET_COMMENTS_FETCH_MORE',
  SET_COMMENTS_LOADING = '@@track/SET_COMMENTS_LOADING'
}
