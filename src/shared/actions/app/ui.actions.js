import { actionTypes } from '../../constants'

export function toggleQueue(toggle) {
    return (dispatch, getState) => {
        const { ui: { queue } } = getState()

        dispatch({
            type: actionTypes.UI_TOGGLE_QUEUE,
            payload: (toggle != null ? toggle : !queue)
        })
    }
}

export function setScrollPosition(scrollTop, pathname) {
    return {
        type: actionTypes.UI_SET_SCROLL_TOP,
        payload: {
            scrollTop,
            pathname

        }
    }
}