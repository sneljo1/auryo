import "@common/sentryReporter";
// eslint-disable-next-line import/no-extraneous-dependencies
import { app } from "electron";
import { Auryo } from "./app";
import { Logger } from "./utils/logger";
import { configureStore } from "@common/configureStore";

if (process.env.TOKEN) {
	process.env.ENV = "test";
}

if (process.argv.some(arg => arg === "--development") || process.argv.some(arg => arg === "--dev")) {
	process.env.ENV = "development";
}

const store = configureStore();

const auryo = new Auryo(store);

// Quit when all windows are closed
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (auryo.mainWindow) {
		auryo.mainWindow.show();
	} else {
		// Something went wrong
		app.quit();
	}
});

async function installExtensions() {
	// eslint-disable-next-line
	const installer = require("electron-devtools-installer");
	const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
	const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];

	return Promise.all(extensions.map(name => installer.default(installer[name], forceDownload)));
}

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on("ready", async () => {
	app.accessibilitySupportEnabled = true;

	try {
		if (process.env.NODE_ENV === "development") {
			await installExtensions();

			// eslint-disable-next-line
			require("devtron").install();
		}
		await auryo.start();
	} catch (err) {
		Logger.defaultLogger().error(err);
	}
});
