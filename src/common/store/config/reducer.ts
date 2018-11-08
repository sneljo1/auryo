import { Reducer } from 'redux';
import { CONFIG } from '../../../config';
import { PlayerActionTypes } from '../player';
import { ConfigActionTypes, ConfigState } from './types';
import _ = require('lodash');

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
                ...state,
            };

            _.set(newConfig, payload.key, payload.value);

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
