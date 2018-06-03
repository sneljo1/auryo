import { actionTypes } from '../../../shared/constants'

export function toggleQueue(toggle) {
    return (dispatch, getState) => {
        const { ui: { queue } } = getState()

        dispatch({
            type: actionTypes.UI_TOGGLE_QUEUE,
            payload: (toggle != null ? toggle : !queue)
        })
    }
}

export function setScrollPosition(scrollTop) {
    return (dispatch, getState) => {
        const { routing: { location: { pathname } } } = getState()

        dispatch({
            type: actionTypes.UI_SET_SCROLL_TOP,
            payload: {
                scrollTop,
                pathname

            }
        })
    }
}