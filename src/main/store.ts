import { ipcMain, IpcMessageEvent } from 'electron';
import { applyMiddleware, compose, createStore, Store, Action } from 'redux';
import { electronEnhancer } from 'redux-electron-store';
import thunk from 'redux-thunk';
import { StoreState, rootReducer } from '../common/store';

const enhancer = compose(
  applyMiddleware(thunk),
  electronEnhancer()
);

const configureStore = () => {
  const store: Store<StoreState> = createStore<StoreState, Action<any>, any, any>(rootReducer, enhancer as any);

  ipcMain.on('renderer-reload', (event: IpcMessageEvent) => {
    delete require.cache[require.resolve('../common/store')];
    import('../common/store')
      .then(({ rootReducer }) => {
        store.replaceReducer(rootReducer);
        event.returnValue = true;
      });
  });

  return store;
};

export { configureStore };
