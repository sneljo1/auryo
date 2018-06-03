import { actionTypes } from '../constants'

const initialState = {
    queue: false,
    scrollTop: 0,
    scrollPosition: {}
}

export default function config(state = initialState, action) {
    const { payload, type } = action

    switch (type) {
        case actionTypes.UI_TOGGLE_QUEUE:
            return {
                ...state,
                queue: payload
            }
        case actionTypes.UI_SET_SCROLL_TOP:
            return {
                ...state,
                scrollPosition: {
                    ...state.scrollPosition,
                    [payload.pathname]: payload.scrollTop
                }
            }
        case actionTypes.APP_RESET_STORE:
            state = initialState
        default:
            return state
    }

}
