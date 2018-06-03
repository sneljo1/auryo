import { actionTypes } from '../constants';

export function setToken(token) {
    return {
        type: actionTypes.CONFIG_SET_TOKEN,
        payload: token
    };
}

export function setConfig(config) {
    return {
        type: actionTypes.CONFIG_SET,
        payload: config
    };
}

export function setConfigKey(key, value) {
    return {
        type: actionTypes.CONFIG_SET_KEY,
        payload: {
            key,
            value
        }
    };
}
