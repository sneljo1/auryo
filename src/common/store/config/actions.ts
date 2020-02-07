import { TokenResponse } from '@main/aws/awsIotService';
import { action } from 'typesafe-actions';
import { ConfigActionTypes, ConfigState } from './types';

export const setLogin = (tokenResponse: TokenResponse) => action(ConfigActionTypes.SET_LOGIN, tokenResponse);
export const setToken = (token: string | null) => action(ConfigActionTypes.SET_TOKEN, token);

export const setConfig = (config: ConfigState) => action(ConfigActionTypes.SET_ALL, config);

export const setConfigKey = (key: string, value: ConfigValue) => ({
  type: ConfigActionTypes.SET_KEY,
  payload: {
    key,
    value
  }
});

export type ConfigValue = string | number | boolean | object | null | (string | number | object)[];
