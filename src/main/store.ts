import { rootReducer, StoreState } from "@common/store";
import { ipcMain } from "electron";
import { Action, applyMiddleware, compose, createStore, Store } from "redux";
import { electronEnhancer } from "redux-electron-store";
import thunk from "redux-thunk";

const enhancer = compose(
	applyMiddleware(thunk),
	electronEnhancer()
);

const store: Store<StoreState> = createStore<any, Action, any, any>(rootReducer, enhancer as any);

const configureStore = (): Store<StoreState> => {

	ipcMain.on("renderer-reload", (event) => {
		// tslint:disable-next-line: no-dynamic-delete
		delete require.cache[require.resolve("@common/store")];

		const { rootReducer } = require("@common/store");

		store.replaceReducer(rootReducer);
		event.returnValue = true;
	});

	return store;
};

export { configureStore };

