import { ipcMain, IpcMessageEvent } from 'electron';
import { applyMiddleware, compose, createStore, Store } from 'redux';
import { electronEnhancer } from 'redux-electron-store';
import thunk from 'redux-thunk';
import { StoreState, rootReducer } from '../shared/reducers';

const enhancer = compose(
  applyMiddleware(thunk),
  electronEnhancer()
);

const configureStore = () => {
  const store: Store<StoreState> = createStore<StoreState>(rootReducer, enhancer as any);

  ipcMain.on('renderer-reload', (event: IpcMessageEvent) => {
    delete require.cache[require.resolve('../shared/reducers')];
    store.replaceReducer(require('../shared/reducers')); // eslint-disable-line global-require
    event.returnValue = true; // eslint-disable-line no-param-reassign
  });

  return store;
};

export { configureStore };
