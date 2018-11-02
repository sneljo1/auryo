declare module 'redux-electron-store' {
    import { StoreEnhancer } from "redux";

    namespace ReduxElectronStore {

        function electronEnhancer(opts?: { filter: object }): StoreEnhancer<any>;

    }

    export = ReduxElectronStore;
}