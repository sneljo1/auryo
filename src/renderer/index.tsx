import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@common/sentryReporter";
import { SC } from "@common/utils";
import "boxicons/css/boxicons.min.css";
// eslint-disable-next-line import/no-extraneous-dependencies
import { remote } from "electron";
import is from "electron-is";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import { App } from "./App";
import { configureStore } from "./configureStore";
import "./css/app.scss";
import { history } from "./history";

const { app } = remote;

let osClass = "";

if (is.macOS()) {
	osClass = "macOS";
} else if (is.windows()) {
	osClass = "win";
} else if (is.linux()) {
	osClass = "linux";
}

document.getElementsByTagName("html")[0].classList.add(osClass);

if (process.env.NODE_ENV === "development") {
	// const { whyDidYouUpdate } = require('why-did-you-update');
	// whyDidYouUpdate(React);
}

const store = configureStore(history);

if (!process.env.TOKEN && process.env.NODE_ENV === "production") {
	const {
		config: {
			app: { analytics }
		}
	} = store.getState();

	// eslint-disable-next-line
	const { ua } = require("@common/utils/universalAnalytics");

	ua.set("version", app.getVersion());
	ua.set("anonymizeIp", true);
	if (analytics) {
		ua.pv("/").send();

		history.listen(location => {
			ua.pv(location.pathname).send();
		});
	}
}

const {
	config: {
		auth: { token }
	}
} = store.getState();

if (token) {
	SC.initialize(token);
}

const render = () => {
	ReactDOM.render(
		<AppContainer>
			<App history={history} store={store} />
		</AppContainer>,
		document.getElementById("root")
	);
};

render();

// Hot reloading
if (module.hot) {
	// Reload components
	module.hot.accept("./App", () => {
		render();
	});
}
