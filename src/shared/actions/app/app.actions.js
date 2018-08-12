/**
 * Fetch all auth data. Set app loaded if all has been fetched.
 *
 * @returns {function(*, *)}
 */
import { actionTypes } from '../../constants'
import { getAuthFeed, getAuthPlaylists } from '../playlist.actions'
import { getAuthFollowings } from '../auth/following.actions'
import { getAuthReposts } from '../track/reposts.actions'
import { getAuthLikeIds, getAuthLikesIfNeeded } from '../auth/authLikes.actions'
import { SC } from '../../utils'
import { getAuth } from '../auth/auth.actions'
import { replace } from 'react-router-redux'
import { initWatchers, openExternal, resolveUrl, stopWatchers, writeToClipboard } from './window.actions'

export * from './offline.actions'
export * from './ui.actions'

export {
    initWatchers, openExternal, resolveUrl, writeToClipboard
}

export function initApp() {
    return (dispatch, getState) => {

        const { config: { token } } = getState()

        if (!token) {
            dispatch(replace('/login'))
            return
        }

        SC.initialize(token)

        dispatch(initWatchers())

        if (process.env.NODE_ENV === 'development') {
            dispatch({
                type: 'APP_RESET_STORE'
            })
        }


        return dispatch({
            type: actionTypes.APP_SET_LOADED,
            payload: Promise.all([
                dispatch(getAuth()),
                dispatch(getAuthFollowings()),
                dispatch(getAuthReposts()),

                dispatch(getAuthFeed()),
                dispatch(getAuthLikesIfNeeded()),
                dispatch(getAuthLikeIds()),
                dispatch(getAuthPlaylists())
            ])
        })
    }
}

export function cleanApp() {
    return dispatch => {

        dispatch(stopWatchers())
    }
}

export function setDimensions(dimensions) {
    return {
        type: actionTypes.APP_SET_DIMENSIONS,
        payload: dimensions
    }
}

export function canGoInHistory(back, next) {
    return {
        type: actionTypes.APP_SET_CAN_GO,
        payload: {
            back,
            next
        }
    }
}