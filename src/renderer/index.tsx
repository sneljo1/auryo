// tslint:disable-next-line:no-submodule-imports
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@common/sentryReporter";
import { SC } from "@common/utils";
// tslint:disable-next-line:no-submodule-imports
import "boxicons/css/boxicons.min.css";
import { remote } from "electron";
import * as is from "electron-is";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { configureStore, history } from "./configureStore";
import "./css/app.scss";
import Main from "./Main";
import * as serviceWorker from "./serviceWorker";

const app = remote.app;

let osClass = "";

if (is.macOS()) {
    osClass = "macOS";;
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

const store = configureStore();

if (!process.env.TOKEN && process.env.NODE_ENV === "production") {

    const { config: { app: { analytics } } } = store.getState();

    const { ua } = require("@common/utils/universalAnalytics");

    ua.set("version", app.getVersion());
    ua.set("anonymizeIp", true);
    if (analytics) {
        ua.pv("/").send();

        history.listen((location) => {
            ua.pv(location.pathname).send();
        });
    }

}

const { config: { auth: { token } } } = store.getState();

if (token) {
    SC.initialize(token);
}

ReactDOM.render(
    <Main
        store={store}
        history={history}
    />,
    document.getElementById("root")
);

serviceWorker.register();

