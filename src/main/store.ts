import { ipcMain, IpcMessageEvent } from 'electron';
import { Action, applyMiddleware, compose, createStore, Store } from 'redux';
import { electronEnhancer } from 'redux-electron-store';
import thunk from 'redux-thunk';
import { rootReducer, StoreState } from '../common/store';

const enhancer = compose(
  applyMiddleware(thunk),
  electronEnhancer()
);


const configureStore = () => {
  const store: Store<StoreState> = createStore<StoreState, Action<any>, any, any>(rootReducer as any, enhancer as any);

  ipcMain.on('renderer-reload', (event: IpcMessageEvent) => {
    delete require.cache[require.resolve('../common/store')];
    import('../common/store')
      .then(({ rootReducer }) => {
        store.replaceReducer(rootReducer as any);
        event.returnValue = true;
      });
  });

  return store;
};

export { configureStore };

