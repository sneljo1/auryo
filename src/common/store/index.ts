import { resetStore } from '@common/store/actions';
import { PlayerActionTypes } from '@common/store/player';
import { rootReducer } from '@common/store/rootReducer';
import { mainRootEpic } from '@main/store/rootEpic';
import { Logger } from '@main/utils/logger';
import { StoreState } from 'AppReduxTypes';
import { routerMiddleware } from 'connected-react-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import electron, { ipcRenderer } from 'electron';
import is from 'electron-is';
import { mainStateSyncEnhancer, rendererStateSyncEnhancer, stopForwarding } from 'electron-redux';
import { createMemoryHistory } from 'history';
import { Action, applyMiddleware, compose, createStore, Middleware, StoreEnhancer } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createLogger } from 'redux-logger';
import { createEpicMiddleware } from 'redux-observable';
import { BehaviorSubject } from 'rxjs';
import { RootAction } from './declarations';
import { rootEpic } from './rootEpic';

export const history = createMemoryHistory();

export const configureStore = () => {
  const epic$ = new BehaviorSubject(rootEpic);
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
  const middlewares: Middleware[] = [...(is.dev() ? devMiddlewares : []), epicMiddleware];

  const generateMiddlewares = (): Middleware[] =>
    is.renderer() ? [connectRouterMiddleware, ...middlewares] : [...middlewares];

  const enhancers: StoreEnhancer[] = [is.renderer() ? rendererStateSyncEnhancer({}) : mainStateSyncEnhancer()];

  if (is.renderer() && is.dev()) {
    enhancers.push(devToolsEnhancer({}));
  }

  const middleware = applyMiddleware(...generateMiddlewares());

  const enhancer: StoreEnhancer = compose(middleware, ...enhancers);

  const store = createStore(rootReducer(history), enhancer);

  if (is.renderer()) {
    window.onbeforeunload = () => {
      store.dispatch(resetStore());
    };
    epicMiddleware.run(rootEpic);

    // HACK: electron-redux currently only works like this https://github.com/klarna/electron-redux/issues/285
    ipcRenderer.on('electron-redux.ACTION', (_, action: Action) => {
      store.dispatch(stopForwarding(action));
    });
  } else {
    epicMiddleware.run(mainRootEpic);

    // HACK: electron-redux currently only works like this https://github.com/klarna/electron-redux/issues/285
    electron.ipcMain.on('electron-redux.ACTION', (event, action) => {
      const localAction = stopForwarding(action);
      store.dispatch(localAction); // Forward it to all of the other renderers
      electron.webContents.getAllWebContents().forEach(contents => {
        // Ignore the renderer that sent the action and chromium devtools
        if (contents.id !== event.sender.id && !contents.getURL().startsWith('devtools://')) {
          contents.send('electron-redux.ACTION', localAction);
        }
      });
    });
  }
  // epicMiddleware.run(rootEpic);

  if (module.hot) {
    module.hot.accept('@common/store', () => {
      import('@common/store/rootReducer').then(({ rootReducer: nextReducer }) =>
        store.replaceReducer(nextReducer(history))
      );
    });

    module.hot.accept('@common/store/rootEpic', () => {
      import('@common/store/rootEpic').then(({ rootEpic: nextRootEpic }) => epic$.next(nextRootEpic));
    });
  }

  return store;
};
