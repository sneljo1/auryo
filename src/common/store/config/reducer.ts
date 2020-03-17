import immutable from 'object-path-immutable';
import { createReducer } from 'typesafe-actions';
import { CONFIG } from '../../../config';
import { setConfig, setConfigKey } from './actions';
import { ConfigState } from './types';

const initialState = CONFIG.DEFAULT_CONFIG;

export const configReducer = createReducer<ConfigState>(initialState)
  .handleAction(setConfig, (state, action) => {
    const { payload } = action;

    return {
      ...state,
      ...payload
    };
  })
  .handleAction(setConfigKey, (state, action) => {
    const { payload } = action;

    console.log(payload, action.type, process.type);
    return {
      ...state,
      ...immutable.set(state, payload.key, payload.value)
    };
  });
