import { actionTypes } from '../constants';
import { onError, onSuccess } from '../utils/reduxUtils';

const initialState = {
    history: {
        back: false,
        next: false
    },
    loaded: false,
    loading_error: null,
    offline: false,
    update: {
        available: false,
        version: null
    },
    last_checked: 0,
    queued_functions: {},
    queued_items: [],
    dimensions: {
        width: 0,
        height: 0
    }
};

export default function entities(state = initialState, action) {
    const { payload, type } = action;

    switch (type) {
        case actionTypes.APP_SET_CAN_GO:
            return {
                ...state,
                history: {
                    ...state.history,
                    next: payload.next,
                    back: payload.back
                }
            };
        case actionTypes.APP_TOGGLE_OFFLINE:
            return {
                ...state,
                offline: payload.offline,
                last_checked: payload.time
            };
        case actionTypes.APP_PUSH_OFFLINE_QUEUE:
            return {
                ...state,
                queued_functions: {
                    ...state.queued_functions,
                    [payload.key]: payload.func
                },
                queued_items: [
                    ...state.queued_items,
                    payload.key
                ]
            };
        case actionTypes.APP_POP_OFFLINE_QUEUE:
            return {
                ...state,
                queued_items: state.queued_items.filter((key) => payload.key !== key)
            };
        case actionTypes.APP_CLEAR_OFFLINE_QUEUE:
            return {
                ...state,
                offline: false,
                queued_functions: {}
            };
        case onError(actionTypes.APP_SET_LOADED):
            return {
                ...state,
                loading_error: payload.message
            };
        case onSuccess(actionTypes.APP_SET_LOADED):
            return {
                ...state,
                loaded: true,
                loading_error: null
            };
        case actionTypes.APP_SET_DIMENSIONS:
            return {
                ...state,
                dimensions: payload
            };
        case actionTypes.APP_SET_UPDATE_AVAILABLE:
            return {
                ...state,
                update: {
                    ...state.update,
                    available: true,
                    version: payload.version
                }
            };
        case actionTypes.APP_RESET_STORE:
            state = initialState;
        default:
            return state;
    }

}
