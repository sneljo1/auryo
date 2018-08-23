import { CONFIG } from '../../config';
import { actionTypes } from '../constants';
import { setToValue } from '../utils';

const initialState = CONFIG.DEFAULT_CONFIG

export default function config(state = initialState, action) {
    const { payload, type } = action

    switch (type) {
        case actionTypes.CONFIG_SET_TOKEN:
            return {
                ...state,
                token: payload
            }
        case actionTypes.CONFIG_SET:
            return {
                ...state,
                ...payload
            }
        case actionTypes.CONFIG_SET_KEY:
            return {
                ...setToValue(state, payload.value, payload.key)
            }
        default:
            return state
    }

}
