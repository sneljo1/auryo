/* eslint-disable no-underscore-dangle */
import { ipcRenderer } from 'electron';
import { createHashHistory } from 'history';
import { toastr } from 'react-redux-toastr';
import { routerMiddleware } from 'react-router-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import { electronEnhancer } from 'redux-electron-store';
import createLogger from 'redux-logger';
import promiseMiddleware from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import { isOnline } from '../shared/actions/app/offline.actions';
import { logout } from '../shared/actions/auth/auth.actions';
import { REDUX_STATES } from '../shared/constants';
import { PLAYER_SET_TIME, UI_SET_SCROLL_TOP } from '../shared/constants/actionTypes';
import rootReducer from '../shared/reducers';

const history = createHashHistory()

const router = routerMiddleware(history)

const test = store => next => action => {

    if (action.type && action.type.endsWith('_ERROR')) {
        const { payload: { message } } = action

        if (message === 'Failed to fetch') {
            const { app: { offline } } = store.getState()

            if (!offline) {
                store.dispatch(isOnline())
            }

        } else if (action.payload.response && action.payload.response.status === 401) {
            store.dispatch(logout())

        } else if (message) {
            toastr.error('Unable to execute this action', message)
        }
    }
    try {
        return next(action)
    } catch (err) {
        console.error('Caught an exception!', err)
        throw err
    }
}

const logger = createLogger({
    level: 'info',
    collapsed: true,
    predicate: (getState, action) => action.type !== UI_SET_SCROLL_TOP && action.type !== PLAYER_SET_TIME
})

const middleware = [
    test,
    thunk,
    router,
    promiseMiddleware({
        promiseTypeSuffixes: Object.keys(REDUX_STATES)
    })
]

if (process.env.NODE_ENV === 'development') {
    middleware.push(logger)
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ :
    compose

const enhancer = composeEnhancers(applyMiddleware(...middleware), electronEnhancer({
    filter: {
        app: true,
        config: true,
        player: {
            status: true,
            currentPlaylistId: true,
            playingTrack: true
        },
        routing: true,
        auth: {
            authentication: true
        }
    }
}))

const configureStore = (initialState) => {
    const store = createStore(rootReducer, initialState, enhancer)

    if (module.hot) {
        module.hot.accept('../shared/reducers', () => {
            ipcRenderer.sendSync('renderer-reload')
            store.replaceReducer(require('../shared/reducers')) // eslint-disable-line global-require
        }
        )
    }

    return store
}

export { configureStore, history };

