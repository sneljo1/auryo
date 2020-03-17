import { resetStore } from '@common/store/actions';
import { PlayerActionTypes } from '@common/store/player';
import { rootReducer } from '@common/store/rootReducer';
import { Logger } from '@main/utils/logger';
import { RootState } from 'AppReduxTypes';
import { routerMiddleware } from 'connected-react-router';
import is from 'electron-is';
import {
  forwardToMainWithParams,
  forwardToRenderer,
  getInitialStateRenderer,
  replayActionMain,
  replayActionRenderer,
  triggerAlias
} from 'electron-redux';
import { createMemoryHistory } from 'history';
import { applyMiddleware, createStore, Middleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLogger } from 'redux-logger';
import { createEpicMiddleware } from 'redux-observable';
import { BehaviorSubject } from 'rxjs';
import { rootEpic } from './rootEpic';
import { RootAction } from './types';
import thunk from 'redux-thunk';

const epic$ = new BehaviorSubject(rootEpic);
export const history = createMemoryHistory();

history.listen(loc => console.log(process.type, loc));

const epicMiddleware = createEpicMiddleware<RootAction, RootAction, RootState>();
const connectRouterMiddleware = routerMiddleware(history);

/** configure dev middlewares */
const devMiddlewares: Middleware[] = [
  is.renderer()
    ? createLogger({
        level: 'info',
        collapsed: true,
        predicate: (_getState: () => any, action: any) => action.type !== PlayerActionTypes.SET_TIME
      })
    : () => next => action => {
        const reduxLogger = Logger.createLogger('REDUX');

        if (action.error) {
          reduxLogger.error(action.type, action.error);
        } else {
          reduxLogger.debug(action.type);
        }

        return next(action);
      }
];

/** configure production middlewares */
const middlewares: Middleware[] = [thunk, ...(is.dev() ? devMiddlewares : [])];

const generateMiddlewares = (): Middleware[] =>
  is.renderer()
    ? [
        forwardToMainWithParams({
          blacklist: [] // [/^@@(ui)/]
        }),
        connectRouterMiddleware,
        ...middlewares
      ]
    : [triggerAlias, ...middlewares, epicMiddleware, forwardToRenderer];

const enhancer = composeWithDevTools(applyMiddleware(...generateMiddlewares()));

const initialState = is.renderer() ? getInitialStateRenderer() : {};

const store = createStore(rootReducer(history), initialState, enhancer);

// Replay actions for redux sync
const replayAction = is.renderer() ? replayActionRenderer : replayActionMain;
replayAction(store);

if (is.renderer()) {
  window.onbeforeunload = () => {
    store.dispatch(resetStore());
  };
} else {
  epicMiddleware.run(rootEpic);
}

export default store;

if (module.hot) {
  module.hot.accept('@common/store', () => {
    // eslint-disable-next-line global-require
    const nextReducer = require('@common/store/rootReducer').rootReducer;
    store.replaceReducer(nextReducer);
  });

  module.hot.accept('@common/store/rootEpic', () => {
    // eslint-disable-next-line global-require
    const nextRootEpic = require('@common/store/rootEpic').rootEpic;
    epic$.next(nextRootEpic);
  });
}
