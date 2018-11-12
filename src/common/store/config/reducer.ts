import { Reducer } from 'redux';
import { CONFIG } from '../../../config';
import { PlayerActionTypes } from '../player';
import { ConfigActionTypes, ConfigState } from './types';
import * as _ from 'lodash';

const initialState = CONFIG.DEFAULT_CONFIG;

export const configReducer: Reducer<ConfigState> = (state = initialState, action) => {
    const { payload, type } = action;

    switch (type) {
        case ConfigActionTypes.SET_TOKEN:
            return {
                ...state,
                token: payload
            };
        case ConfigActionTypes.SET_ALL:
            return {
                ...state,
                ...payload
            };
        case ConfigActionTypes.SET_KEY:

            const newConfig = {
                ..._.set(state, payload.key, payload.value),

                // Otherwise redux connect doesn't correctly re-trigger
                updatedAt: Date.now()
            };

            return newConfig;
        case PlayerActionTypes.TOGGLE_SHUFFLE:
            return {
                ...state,
                shuffle: payload.value,
            };
        default:
            return state;
    }

};
