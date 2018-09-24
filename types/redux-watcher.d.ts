declare module 'redux-watcher' {
    import { Store } from "redux";

    class ReduxWatcher {

        constructor(store: Store<any>);

        watch(path: string | string[], callback: Function) : void;
        off(path: string | string[], callback: Function) : void;

    }

    export = ReduxWatcher;
}