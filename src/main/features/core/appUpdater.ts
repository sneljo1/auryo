import { Intent } from "@blueprintjs/core";
import { EVENTS } from "@common/constants/events";
import { setUpdateAvailable } from "@common/store/app";
import { addToast } from "@common/store/ui";
import { app, shell } from "electron";
import * as is from "electron-is";
import { autoUpdater } from "electron-updater";
import * as request from "request";
import { gt as isVersionGreaterThan, valid as parseVersion } from "semver";
import { CONFIG } from "../../../config";
import { Logger, LoggerInstance } from "../../utils/logger";
import { Feature } from "../feature";

export default class AppUpdater extends Feature {
	private readonly logger: LoggerInstance = Logger.createLogger(AppUpdater.name);

	private hasUpdate: boolean = false;
	private readonly currentVersion: string | null = parseVersion(app.getVersion());

	public shouldRun() {
		return (
			!process.env.TOKEN &&
			process.env.NODE_ENV === "production" &&
			!(process.platform === "linux" && process.env.SNAP_USER_DATA != null)
		);
	}

	public register() {
		const timer = setTimeout(async () => {
			try {
				await this.update();
			} catch (err) {
				this.logger.error(err);
			}
		}, 10000);

		this.timers.push(timer);
	}

	public notify = (version: string) => {
		this.store.dispatch(setUpdateAvailable(version));

		this.store.dispatch(
			addToast({
				message: `Update available`,
				intent: Intent.SUCCESS
			})
		);
	};

	public update = async () => {
		if (is.linux()) {
			this.updateLinux();
		} else {
			autoUpdater.addListener("update-available", () => {
				this.hasUpdate = true;
				this.logger.info("New update available");
			});

			autoUpdater.addListener("update-downloaded", info => {
				this.notify(info.version);

				this.listenUpdate();
			});
			autoUpdater.addListener("error", error => {
				this.logger.error(error);
			});
			autoUpdater.addListener("checking-for-update", () => {
				this.logger.info("Checking for update");
			});
			autoUpdater.addListener("update-not-available", () => {
				this.logger.info("No update found");

				setTimeout(async () => {
					try {
						await autoUpdater.checkForUpdates();
					} catch (err) {
						throw err;
					}
				}, 300000);
			});

			await autoUpdater.checkForUpdates();
		}
	};

	public listenUpdate = () => {
		this.on(EVENTS.APP.UPDATE, async () => {
			if (this.hasUpdate) {
				this.logger.info("Updating now!");

				try {
					if (is.linux() || is.macOS()) {
						// tslint:disable-next-line: no-http-string
						await shell.openExternal("http://auryo.com#downloads");
					} else {
						autoUpdater.quitAndInstall(true, true);
					}
				} catch (err) {
					this.logger.error("Error during update", err);
				}
			}
		});
	};

	public updateLinux = () => {
		request(
			{
				url: CONFIG.UPDATE_SERVER_HOST,
				headers: {
					"User-Agent": "request"
				}
			},
			(error, response, body) => {
				if (!error && response.statusCode === 200) {
					const obj = JSON.parse(body);
					if (!obj || obj.draft || !obj.tag_name) {
						return;
					}
					const latest = parseVersion(obj.tag_name);

					if (latest && this.currentVersion && isVersionGreaterThan(latest, this.currentVersion)) {
						this.logger.info("New update available");
						this.hasUpdate = true;

						this.notify(latest);

						this.listenUpdate();
					}
				} else {
					this.logger.error(error);
				}
			}
		);
	};
}
