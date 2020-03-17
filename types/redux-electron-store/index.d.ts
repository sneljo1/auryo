declare module 'redux-electron-store' {
  import { StoreEnhancer, AnyAction } from 'redux';

  namespace ReduxElectronStore {
    function electronEnhancer(opts?: {
      filter?: object | boolean;
      dispatchProxy?: (action: AnyAction) => any;
    }): StoreEnhancer<any>;
  }

  export = ReduxElectronStore;
}
