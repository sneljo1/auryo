import { rootReducer, StoreState } from "@common/store";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcMain } from "electron";
import { Action, applyMiddleware, compose, createStore, Store } from "redux";
import { electronEnhancer } from "redux-electron-store";
import thunk from "redux-thunk";

const enhancer = compose(
	applyMiddleware(thunk),
	electronEnhancer()
);

const store: Store<StoreState> = createStore<any, Action, any, any>(rootReducer(), enhancer as any);

const configureStore = (): Store<StoreState> => {
	ipcMain.on("renderer-reload", event => {
		// tslint:disable-next-line: no-dynamic-delete
		delete require.cache[require.resolve("@common/store")];

		// eslint-disable-next-line
		const { rootReducer: newrootReducer } = require("@common/store");

		store.replaceReducer(newrootReducer());
		// eslint-disable-next-line no-param-reassign
		event.returnValue = true;
	});

	return store;
};

export { configureStore };
