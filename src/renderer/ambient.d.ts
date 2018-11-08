import '';

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
        SC: any;
    }

    interface NodeModule {
        hot?: any;
    }

}
