/* eslint-disable no-underscore-dangle */
import { ipcRenderer } from 'electron';
import { createHashHistory } from 'history';
import { applyMiddleware, compose, createStore, Middleware, Store } from 'redux';
import { electronEnhancer } from 'redux-electron-store';
import { createLogger } from 'redux-logger';
import promiseMiddleware from 'redux-promise-middleware';
import thunk from 'redux-thunk';
import { rootReducer, StoreState } from '../common/store';
import { logout } from '../common/store/auth';
import { PlayerActionTypes } from '../common/store/player';
import { UIActionTypes, addToast } from '../common/store/ui';
import { REDUX_STATES } from '../types';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { Intent } from '@blueprintjs/core';

const history = createHashHistory();

const router = routerMiddleware(history);

const test: Middleware = (store) => (next) => (action) => {

    if (action.type && action.type.endsWith('_ERROR')) {
        const { payload: { message, response } } = action as any;

        if (message && message === 'Failed to fetch') {
            // const { app: { offline } } = store.getState()


        } else if (response && response.status === 401) {
            store.dispatch<any>(logout());
        } else if (message) {
            store.dispatch(addToast({
                message: 'Something went wrong',
                intent: Intent.DANGER
            }));
        }
    }
    try {
        return next(action);
    } catch (err) {
        console.error('Caught an exception!', err);
        throw err;
    }
};

const logger = createLogger({
    level: 'info',
    collapsed: true,
    predicate: (_getState: () => any, action: any) => action.type !== UIActionTypes.SET_SCROLL_TOP && action.type !== PlayerActionTypes.SET_TIME
} as any);

const middleware = [
    test,
    thunk,
    router,
    promiseMiddleware({
        promiseTypeSuffixes: Object.keys(REDUX_STATES)
    })
];

if (process.env.NODE_ENV === 'development') {
    middleware.push(logger);
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ :
    compose;

const enhancer = composeEnhancers(applyMiddleware(...middleware), electronEnhancer({
    filter: {
        app: true,
        config: true,
        player: {
            status: true,
            currentPlaylistId: true,
            playingTrack: true
        },
        modal: true,
        auth: {
            authentication: true
        },
        ui: {
            toasts: true
        }
    }
}));

const configureStore = (): Store<StoreState> => {
    const store: Store<StoreState> = createStore(connectRouter(history)(rootReducer), enhancer);

    if (module.hot) {
        module.hot.accept('../common/store', () => {
            ipcRenderer.sendSync('renderer-reload');

            import('../common/store')
                .then(({ rootReducer }) => {
                    store.replaceReducer(connectRouter(history)(rootReducer) as any);
                });
        });
    }

    return store;
};

export { configureStore, history };

