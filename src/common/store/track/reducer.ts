import { createReducer } from 'typesafe-actions';
import { resetStore } from '../actions';
import { TrackState } from '../types';
import { getTrack } from './actions';

const initialState: TrackState = {
  loading: [],
  error: {}
};

export const trackReducer = createReducer<TrackState>(initialState)
  .handleAction(getTrack.request, (state, action) => {
    const { trackId } = action.payload;

    const errors = state.error;

    delete errors[trackId];

    return {
      loading: Array.from(new Set([...state.loading, trackId])),
      error: {
        ...errors
      }
    };
  })
  .handleAction(getTrack.success, (state, action) => {
    const { trackId } = action.payload;

    const errors = state.error;

    delete errors[trackId];

    return {
      loading: state.loading.filter((id) => id !== trackId),
      error: {
        ...errors
      }
    };
  })
  .handleAction(getTrack.failure, (state, action) => {
    const { trackId, error } = action.payload;

    return {
      loading: state.loading.filter((id) => id !== trackId),
      error: {
        ...state.error,
        [trackId]: error
      }
    };
  })
  .handleAction(resetStore, () => {
    return initialState;
  });
