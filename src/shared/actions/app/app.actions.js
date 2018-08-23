import { replace } from 'react-router-redux';
import { actionTypes } from '../../constants';
import { SC } from '../../utils';
import { getAuth, getAuthLikeIds, getAuthLikesIfNeeded, getAuthFollowings } from '../auth/auth.actions';
import { getAuthFeed, getAuthPlaylists } from '../playlist.actions';
import { getAuthReposts } from '../track/reposts.actions';
import { initWatchers, openExternal, resolveUrl, stopWatchers, writeToClipboard } from './window.actions';

export * from './offline.actions';
export * from './ui.actions';
export { initWatchers, openExternal, resolveUrl, writeToClipboard };


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