import { merge } from 'lodash';
import { Reducer } from 'redux';
import { AppActionTypes } from '../app';
import { EntitiesState } from './types';

const initialState = {
  playlistEntities: {},
  trackEntities: {},
  userEntities: {},
  commentEntities: {}
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
