declare module 'redux-electron-store' {
    import { StoreEnhancer } from "redux";

    namespace ReduxElectronStore {

        function electronEnhancer(): StoreEnhancer<any>;

    }

    export = ReduxElectronStore;
}