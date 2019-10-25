// https://github.com/getsentry/sentry-electron/issues/142
// Fix for mod.require
import * as ElectronSentry from "@sentry/electron";
// eslint-disable-next-line import/no-extraneous-dependencies
import { app as electronApp, remote } from "electron";
import * as is from "electron-is";
import { CONFIG } from "../config";
import { settings } from "../main/settings";

require("@sentry/electron/dist/dispatch").specificInit =
	process.type === "browser"
		? require("@sentry/electron/dist/main").init
		: require("@sentry/electron/dist/renderer").init;

const app = is.renderer() ? remote.app : electronApp;
const options: ElectronSentry.ElectronOptions = {
	debug: true,
	enabled:
		!!CONFIG.SENTRY_REPORT_URL &&
		!!settings.get("app.crashReports") === true &&
		process.env.NODE_ENV === "production",
	dsn: CONFIG.SENTRY_REPORT_URL,
	release: app.getVersion(),
	environment: process.env.NODE_ENV
};

ElectronSentry.init(options);
// ElectronSentry.configureScope(scope => {
// 	scope.setUser({
// 		id: (settings.get("token") as string) || ""
// 	});
// });
