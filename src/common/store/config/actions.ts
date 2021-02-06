import { createAction } from 'typesafe-actions';
import { ConfigActionTypes, ConfigState, ConfigValue } from '../types';

export const setConfig = createAction(ConfigActionTypes.SET_CONFIG)<ConfigState>();
export const setConfigKey = createAction(ConfigActionTypes.SET_CONFIG_KEY, (key: string, value: ConfigValue) => ({
  key,
  value
}))<{ key: string; value: ConfigValue }>();
