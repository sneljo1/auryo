import { EVENTS } from "@common/constants/events";
import { StoreState } from "@common/store";
import { stopWatchers, initApp } from "@common/store/actions";
import { ConnectedRouter } from "connected-react-router";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from "electron";
import { History } from "history";
import * as React from "react";
import { Provider } from "react-redux";
import { Route, Switch } from "react-router";
import { Store } from "redux";
import Main from "./app/Main";
import OnBoarding from "./pages/onboarding/OnBoarding";

interface OwnProps {
	history: History;
	store: Store<StoreState>;
}

export class App extends React.PureComponent<OwnProps> {
	public componentDidMount() {
		const { history, store } = this.props;

		ipcRenderer.send(EVENTS.APP.READY);

		history.listen(() => {
			ipcRenderer.send(EVENTS.APP.NAVIGATE);
		});

		store.dispatch(initApp() as any);
	}

	public componentWillUnmount() {
		const { store } = this.props;

		store.dispatch(stopWatchers() as any);
	}

	public render() {
		const { history, store } = this.props;

		return (
			<Provider store={store}>
				<ConnectedRouter history={history}>
					<Switch>
						<Route path="/login" component={OnBoarding} />
						<Route path="/" component={Main} />
					</Switch>
				</ConnectedRouter>
			</Provider>
		);
	}
}
