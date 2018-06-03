import { actionTypes } from '../constants'
import { DEFAULT_CONFIG } from '../../config'
import { setToValue } from '../utils'

const initialState = DEFAULT_CONFIG

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
