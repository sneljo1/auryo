export interface TrackState {
  loading: number[];
  error: { [trackId: string]: Error | null };
}

// ACTIONS

export enum TrackActionTypes {
  ADD = 'auryo.track.ADD',
  GET_TRACK = 'auryo.track.GET_TRACK',
  GET_COMMENTS = 'auryo.track.GET_COMMENTS',
  GET_COMMENTS_FETCH_MORE = 'auryo.track.GET_COMMENTS_FETCH_MORE',
  SET_COMMENTS_LOADING = 'auryo.track.SET_COMMENTS_LOADING'
}
