import { merge } from 'lodash';
import { Reducer } from 'redux';
import { EntitiesState, AppActionTypes } from '../types';

const initialState: EntitiesState = {
  playlistEntities: {},
  trackEntities: {},
  userEntities: {},
  commentEntities: {},
  userProfileEntities: {}
};

export const entitiesReducer: Reducer<EntitiesState> = (state = initialState, action) => {
  const { payload, type } = action;

  if (payload && payload.entities) {
    return merge({}, state, payload.entities);
  }

  if (type === AppActionTypes.RESET_STORE) {
    return initialState;
  }

  return state;
};
