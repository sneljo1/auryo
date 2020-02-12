import { clone, curry, setWith } from 'lodash/fp';
import { Reducer } from 'redux';
import { CONFIG } from '../../../config';
import { PlayerActionTypes } from '../player';
import { ConfigActionTypes, ConfigState } from './types';

export const setIn = curry((path: string, value: string, obj: object) => setWith(clone, path, value, clone(obj)));

const initialState = CONFIG.DEFAULT_CONFIG;

export const configReducer: Reducer<ConfigState> = (state = initialState, action) => {
  const { payload, type } = action;

  switch (type) {
    case ConfigActionTypes.SET_TOKEN:
      return {
        ...state,
        auth: {
          ...state.auth,
          token: payload
        }
      };
    case ConfigActionTypes.SET_ALL:
      return {
        ...state,
        ...payload
      };
    case ConfigActionTypes.SET_LOGIN:
      return {
        ...state,
        auth: {
          expiresAt: payload.expires_at,
          refreshToken: payload.refresh_token,
          token: payload.access_token
        }
      };
    case ConfigActionTypes.SET_KEY:
      return {
        ...state,
        ...setIn(payload.key, payload.value, state)
      };

    case PlayerActionTypes.TOGGLE_SHUFFLE:
      return {
        ...state,
        shuffle: payload.value
      };
    default:
      return state;
  }
};
