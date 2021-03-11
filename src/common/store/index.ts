import { resetStore } from '@common/store/actions';
import { PlayerActionTypes } from '@common/store/player';
import { rootReducer } from '@common/store/rootReducer';
import { Logger } from '@main/utils/logger';
import { StoreState } from 'AppReduxTypes';
import { routerMiddleware } from 'connected-react-router';
import is from 'electron-is';
import { composeWithStateSync } from 'electron-redux';
import { createMemoryHistory } from 'history';
import { applyMiddleware, createStore, Middleware, StoreEnhancer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLogger } from 'redux-logger';
import { createEpicMiddleware } from 'redux-observable';
import { RootAction } from './declarations';

export const history = createMemoryHistory();

export const configureStore = () => {
  const epicMiddleware = createEpicMiddleware<RootAction, RootAction, StoreState>();
  const connectRouterMiddleware = routerMiddleware(history);

  /** configure dev middlewares */
  const devMiddlewares: Middleware[] = [
    is.renderer()
      ? createLogger({
          level: 'info',
          collapsed: true,
          predicate: (_getState: () => any, action: any) => action.type !== PlayerActionTypes.SET_TIME
        })
      : () => (next) => (action) => {
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
  const middlewares: Middleware[] = [...(is.dev() ? devMiddlewares : []), epicMiddleware];

  const generateMiddlewares = (): Middleware[] =>
    is.renderer() ? [connectRouterMiddleware, ...middlewares] : [...middlewares];

  const middleware = applyMiddleware(...generateMiddlewares());

  const enhancer: StoreEnhancer = composeWithDevTools(composeWithStateSync(middleware));

  const store = createStore(rootReducer(history), enhancer);

  if (is.renderer()) {
    import('@renderer/epics').then(({ rootEpic }) => {
      epicMiddleware.run(rootEpic);
    });
  } else {
    import('@main/epics').then(({ mainRootEpic }) => {
      epicMiddleware.run(mainRootEpic);
    });
  }

  if (module.hot) {
    module.hot.accept('@common/store', () => {
      import('@common/store/rootReducer').then(({ rootReducer: nextReducer }) => {
        store.replaceReducer(nextReducer(history));
        store.dispatch(resetStore());
      });
    });
  }

  return store;
};
