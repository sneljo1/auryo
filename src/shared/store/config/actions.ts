import { action } from 'typesafe-actions';
import { ConfigActionTypes, ConfigState } from './types';

export const setToken = (token: string | null) => action(ConfigActionTypes.SET_TOKEN, token);
export const setConfig = (config: ConfigState) => action(ConfigActionTypes.SET_ALL, config);
export const setConfigKey = (key: string, value: ConfigValue) => action(ConfigActionTypes.SET_KEY, {
    key,
    value
});

export type ConfigValue = string | number | boolean | object | null | Array<string | number | object>;
