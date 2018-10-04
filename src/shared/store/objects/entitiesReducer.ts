import merge from 'lodash/merge';
import { Reducer } from 'redux';
import { EntitiesState } from './types';
import { AppActionTypes } from '../app';

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