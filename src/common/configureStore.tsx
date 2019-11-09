import { Intent } from "@blueprintjs/core";
import { EVENTS } from "@common/constants/events";
import { rootReducer, StoreState } from "@common/store";
// eslint-disable-next-line import/no-cycle
import { addToast, logout } from "@common/store/actions";
import { PlayerActionTypes } from "@common/store/player";
import { UIActionTypes } from "@common/store/ui";
import { Logger } from "@main/utils/logger";
import { routerMiddleware } from "connected-react-router";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from "electron";
import { History } from "history";
import { applyMiddleware, compose, createStore, Middleware, Store } from "redux";
import { electronEnhancer } from "redux-electron-store";
import { createLogger } from "redux-logger";
import promiseMiddleware, { ActionType } from "redux-promise-middleware";
import thunk from "redux-thunk";

const handleErrorMiddleware: Middleware = (store: Store<StoreState>) => next => action => {
	if (action.type && action.type.endsWith(ActionType.Rejected)) {
		const {
			payload: { message, response }
		} = action;

		if (message && message === "Failed to fetch") {
			// const { app: { offline } } = store.getState()
		} else if (response && response.status === 401) {
			const {
				config: {
					auth: { expiresAt, refreshToken }
				}
			} = store.getState();

			if (!refreshToken) {
				store.dispatch<any>(logout());
			} else if (expiresAt && expiresAt < Date.now()) {
				ipcRenderer.send(EVENTS.APP.AUTH.REFRESH);
			}
		} else if (message) {
			store.dispatch(
				addToast({
					message: "Something went wrong",
					intent: Intent.DANGER
				})
			);
		}
	}

	return next(action);
};

const configureStore = (history?: History): Store<StoreState> => {
	let middleware = [handleErrorMiddleware, thunk, promiseMiddleware];

	if (history) {
		const router = routerMiddleware(history);
		middleware = [router, ...middleware];
	}

	if (process.env.NODE_ENV === "development") {
		let logger: Middleware;
		if (history) {
			logger = createLogger({
				level: "info",
				collapsed: true,
				predicate: (_getState: () => any, action: any) =>
					action.type !== UIActionTypes.SET_SCROLL_TOP && action.type !== PlayerActionTypes.SET_TIME
			});
		} else {
			logger = () => next => action => {
				const reduxLogger = Logger.createLogger("REDUX");

				if (action.error) {
					reduxLogger.error(action.type, action.error);
				} else {
					reduxLogger.debug(action.type);
				}

				return next(action);
			};
		}
		middleware.push(logger);
	}

	const composeEnhancers =
		typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
			? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
			: compose;

	const enhancer = composeEnhancers(
		applyMiddleware(...middleware),
		electronEnhancer(
			history && {
				filter: {
					app: true,
					config: true,
					player: {
						status: true,
						currentPlaylistId: true,
						playingTrack: true
					},
					modal: true,
					auth: {
						authentication: true
					},
					ui: {
						toasts: true
					}
				}
			}
		)
	);

	const store: Store<StoreState> = createStore(rootReducer(history), enhancer);

	if (module.hot) {
		module.hot.accept("../common/store", () => {
			ipcRenderer.sendSync("renderer-reload");

			// eslint-disable-next-line
			const { rootReducer: newrootReducer } = require("@common/store/index");

			store.replaceReducer(newrootReducer(history));
		});
	}

	return store;
};
export { configureStore };
